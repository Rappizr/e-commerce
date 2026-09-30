"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Check,
  Plus,
  ChevronDown,
  Loader2,
  Trash2,
  Minus,
  Scale,
} from "lucide-react";
import Footer from "../Footer";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import PembayaranComponent from "./component/pembayaran";
import { supabase } from "../penyimpanan/supabase";

interface CourierPricing {
  company: string;
  courier_name: string;
  courier_service_name: string;
  duration: string;
  price: number;
}

interface RajaOngkirCity {
  city_id: string;
  province: string;
  type?: string;
  city_name: string;
  postal_code?: string;
}

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  ).toISOString();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  ).toISOString();

  let nextSequence = 1;

  try {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (!error && typeof count === "number") {
      nextSequence = count + 1;
    }
  } catch (err) {
    console.error("Gagal menghitung urutan order harian:", err);
  }

  const sequenceStr = String(nextSequence).padStart(2, "0");

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSuffix = "";
  for (let i = 0; i < 3; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ORD-${dateStr}${sequenceStr}${randomSuffix}`;
}

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdInvoiceNo, setCreatedInvoiceNo] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Form Field Penerima
  const [nama, setNama] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [selectedBank, setSelectedBank] = useState("bca");

  // RajaOngkir Wilayah
  const [searchCityInput, setSearchCityInput] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [cityResults, setCityResults] = useState<RajaOngkirCity[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Ekspedisi
  const [shippingOptions, setShippingOptions] = useState<CourierPricing[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierPricing | null>(
    null,
  );
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);

  // STATE PRODUK CHECKOUT & CONTEXT KERANJANG
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const {
    cartItems: fullCartItems = [],
    hapusItemDaftar,
    kosongkanKeranjang,
    updateQty: updateQtyContext,
  } = (useKeranjang() as any) || {};

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const courierDropdownRef = useRef<HTMLDivElement | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement | null>(null);
  const shippingAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // LOAD PERTAMA KALI SAJA: ISOLASI DARI RE-TRIGGER CONTEXT
  useEffect(() => {
    try {
      const savedCheckoutItems = sessionStorage.getItem(
        "almaco_checkout_items",
      );
      if (savedCheckoutItems) {
        const parsed = JSON.parse(savedCheckoutItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((item: any) => ({
            ...item,
            qty: Math.max(1, parseInt(String(item.qty || 1), 10)),
            min_grosir: Math.max(1, parseInt(String(item.min_grosir || 5), 10)),
            price: Number(item.price || item.rawPrice || 0),
          }));
          setCheckoutItems(sanitized);
          return;
        }
      }
    } catch (e) {
      console.error("Gagal membaca item checkout dari session storage:", e);
    }

    if (fullCartItems && fullCartItems.length > 0) {
      const sanitized = fullCartItems.map((item: any) => ({
        ...item,
        qty: Math.max(1, parseInt(String(item.qty || 1), 10)),
        min_grosir: Math.max(1, parseInt(String(item.min_grosir || 5), 10)),
        price: Number(item.price || item.rawPrice || 0),
      }));
      setCheckoutItems(sanitized);
    }
  }, []);

  // Kalkulasi Subtotal & Berat
  const subtotal = checkoutItems.reduce((acc: number, item: any) => {
    const price = Number(item.price || item.rawPrice || 0);
    const qty = Math.max(1, parseInt(String(item.qty || 1), 10));
    return acc + price * qty;
  }, 0);

  const totalWeight = checkoutItems.reduce((acc: number, item: any) => {
    const weight = Number(item.weight || 100);
    const qty = Math.max(1, parseInt(String(item.qty || 1), 10));
    return acc + weight * qty;
  }, 0);

  const totalWeightKg =
    totalWeight > 0 ? Math.max(1, Math.ceil(totalWeight / 1000)) : 1;
  const packingFee = checkoutItems.length > 0 ? totalWeightKg * 3000 : 0;
  const shippingFee = selectedCourier ? Number(selectedCourier.price || 0) : 0;
  const total = subtotal + shippingFee + packingFee;

  // Handler Hapus Item Checkout
  const handleRemoveCheckoutItem = (
    id: string | number,
    size?: string,
    color?: string,
  ) => {
    setCheckoutItems((prevItems) => {
      const updated = prevItems.filter((item: any) => {
        if (size && color) {
          return !(
            String(item.id) === String(id) &&
            String(item.size || "")
              .trim()
              .toUpperCase() ===
              String(size || "")
                .trim()
                .toUpperCase() &&
            String(item.color || "")
              .trim()
              .toUpperCase() ===
              String(color || "")
                .trim()
                .toUpperCase()
          );
        }
        return String(item.id) !== String(id);
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "almaco_checkout_items",
          JSON.stringify(updated),
        );
      }
      return updated;
    });

    if (typeof hapusItemDaftar === "function") {
      hapusItemDaftar([{ id, size, color }]);
    }
  };

  // VERSI PERBAIKAN:
  const handleUpdateQtyCheckout = (item: any, direction: number) => {
    const isGrosir = Boolean(item.is_grosir);
    const minGrosir = Math.max(1, parseInt(String(item.min_grosir || 5), 10));

    const currentQty = Math.max(1, parseInt(String(item.qty || 1), 10));
    let nextQty = currentQty;

    if (isGrosir) {
      const step = minGrosir;
      nextQty = direction > 0 ? currentQty + step : currentQty - step;
      if (nextQty < minGrosir) nextQty = minGrosir;
    } else {
      nextQty = direction > 0 ? currentQty + 1 : currentQty - 1;
      if (nextQty <= 0) return;
    }

    // 1. Update Context secara terpisah (Aman dari bentrokan render React)
    if (typeof updateQtyContext === "function") {
      updateQtyContext(item.id, nextQty, item.size, item.color);
    }

    // 2. Update State Checkout Lokal
    setCheckoutItems((prevItems) => {
      const updated = prevItems.map((i: any) => {
        const isSame =
          String(i.id) === String(item.id) &&
          String(i.size || "")
            .trim()
            .toUpperCase() ===
            String(item.size || "")
              .trim()
              .toUpperCase() &&
          String(i.color || "")
            .trim()
            .toUpperCase() ===
            String(item.color || "")
              .trim()
              .toUpperCase();

        if (!isSame) return i;
        return { ...i, qty: nextQty };
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "almaco_checkout_items",
          JSON.stringify(updated),
        );
      }
      return updated;
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        courierDropdownRef.current &&
        !courierDropdownRef.current.contains(target)
      ) {
        setShowCourierDropdown(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(target)
      ) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRates = useCallback(
    async (destinationCityId: string) => {
      if (!destinationCityId || checkoutItems.length === 0) return;

      if (shippingAbortControllerRef.current) {
        shippingAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      shippingAbortControllerRef.current = controller;

      setIsLoadingShipping(true);
      setShippingOptions([]);
      setSelectedCourier(null);

      const calculatedWeight = checkoutItems.reduce(
        (acc: number, item: any) =>
          acc +
          Number(item.weight || 100) * parseInt(String(item.qty || 1), 10),
        0,
      );

      try {
        const res = await fetch("/api/rajaongkir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination_city_id: destinationCityId,
            weight: calculatedWeight,
          }),
          signal: controller.signal,
        });

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }

        if (
          data &&
          data.pricing &&
          Array.isArray(data.pricing) &&
          data.pricing.length > 0
        ) {
          setShippingOptions(data.pricing);
          setSelectedCourier(data.pricing[0]);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Gagal mengambil tarif ongkir:", err);
        }
      } finally {
        setIsLoadingShipping(false);
      }
    },
    [checkoutItems],
  );

  useEffect(() => {
    if (selectedCityId && checkoutItems.length > 0) {
      fetchRates(selectedCityId);
    }
  }, [selectedCityId, fetchRates]);

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchCityInput(val);
    setSelectedCityId("");
    setShippingOptions([]);
    setSelectedCourier(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 3) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCity(true);
    setShowCityDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rajaongkir?q=${encodeURIComponent(val)}`);
        const text = await res.text();
        let data: any = { results: [] };
        try {
          data = JSON.parse(text);
        } catch {
          data = { results: [] };
        }
        setCityResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 400);
  };

  const handleSelectCity = (city: RajaOngkirCity) => {
    const formatted = `${city.type ? city.type + " " : ""}${city.city_name}${city.province ? ", " + city.province : ""}`;
    setSearchCityInput(formatted);
    setSelectedCityId(city.city_id);
    setShowCityDropdown(false);
    fetchRates(city.city_id);
  };

  // Submit Pesanan Ke Supabase
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    if (!nama.trim() || !whatsapp.trim() || !selectedCityId || !alamat.trim()) {
      alert("Mohon lengkapi data penerima dan kota tujuan.");
      return;
    }

    if (!selectedCourier) {
      alert("Silakan pilih salah satu opsi jasa kirim.");
      return;
    }

    if (checkoutItems.length === 0) {
      alert("Tidak ada produk yang dipilih untuk di-checkout.");
      return;
    }

    setIsSubmittingOrder(true);

    const calculatedShipping = Number(selectedCourier.price || 0);
    const calculatedPacking = packingFee;
    const calculatedTotalOngkir = calculatedShipping + calculatedPacking;
    const calculatedTotal = subtotal + calculatedTotalOngkir;
    const formattedWa = whatsapp.startsWith("0")
      ? "62" + whatsapp.slice(1)
      : whatsapp;

    const rawCompany = (
      selectedCourier.courier_name ||
      selectedCourier.company ||
      (selectedCourier as any).code ||
      "JNE"
    )
      .trim()
      .toUpperCase();

    let namaKurirBersih = rawCompany;
    if (rawCompany.includes("JNE")) {
      namaKurirBersih = "JNE";
    } else if (rawCompany.includes("J&T") || rawCompany.includes("JNT")) {
      namaKurirBersih = "J&T EXPRESS";
    } else if (rawCompany.includes("SICEPAT")) {
      namaKurirBersih = "SICEPAT";
    }

    const serviceName = (
      selectedCourier.courier_service_name ||
      (selectedCourier as any).service ||
      ""
    )
      .trim()
      .toUpperCase();

    const kurirFinalSimpan = serviceName
      ? `${namaKurirBersih} - ${serviceName}`
      : namaKurirBersih;

    try {
      const inv = await generateInvoiceNumber();

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            invoice_no: inv,
            nama_pembeli: nama.trim(),
            no_hp: formattedWa,
            alamat_lengkap: `${alamat.trim()} (${searchCityInput})`,
            status: "Menunggu Pembayaran",
            subtotal: subtotal,
            ongkir: calculatedTotalOngkir,
            total: calculatedTotal,
            total_harga: calculatedTotal,
            kurir: kurirFinalSimpan,
            bank_asal: selectedBank.toUpperCase(),
            catatan: catatan.trim() || null,
            berat_total: totalWeight,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      if (orderData) {
        const orderItemsPayload = checkoutItems.map((item: any) => {
          const itemPrice = Number(item.price || item.rawPrice || 0);
          const itemQty = parseInt(String(item.qty || 1), 10);
          return {
            order_id: orderData.id,
            product_id: item.id ? Number(item.id) : null,
            nama_produk: item.title,
            harga: itemPrice,
            qty: itemQty,
            warna: item.color || null,
            ukuran: item.size || null,
            gambar: item.image || null,
            subtotal: itemPrice * itemQty,
          };
        });

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsPayload);
        if (itemsError) throw itemsError;

        for (const item of checkoutItems) {
          if (item.id) {
            const isGrosir = Boolean(item.is_grosir);
            const itemQty = parseInt(String(item.qty || 1), 10);
            const cleanColor = String(item.color || "Default")
              .replace(/\(.*\)/g, "")
              .trim();

            // JIKA GROSIR & DATABASE SUDAH PUNYA TRIGGER INSERT ORDER_ITEMS:
            // Panggilan RPC ini dilewati agar stok grosir tidak terpotong 2x.
            // Jika di database belum ada trigger otomatis, panggil RPC secara khusus:
            if (!isGrosir) {
              await supabase.rpc("rpc_kurangi_stok", {
                p_product_id: Number(item.id),
                p_qty: itemQty,
                p_warna: cleanColor,
              });
            } else {
              // Panggilan khusus Grosir jika TIDAK MENGGUNAKAN TRIGGER DATABASE:
              // (Buka komentar di bawah ini hanya jika database Anda TIDAK memiliki Trigger)
              /*
      await supabase.rpc("rpc_kurangi_stok_grosir", {
        p_product_id: Number(item.id),
        p_qty: itemQty,
      });
      */
            }
          }
        }
      }

      if (typeof hapusItemDaftar === "function") {
        hapusItemDaftar(checkoutItems);
      } else if (typeof kosongkanKeranjang === "function") {
        kosongkanKeranjang();
      }

      setFinalAmount(calculatedTotal);
      setCreatedInvoiceNo(inv);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("almaco_checkout_items");
      }
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Gagal membuat pesanan:", err);
      alert(
        "Terjadi kesalahan saat menyimpan pesanan: " +
          (err.message || "Silakan coba lagi."),
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isSubmitted) {
    return (
      <PembayaranComponent
        totalAmount={finalAmount}
        invoiceId={createdInvoiceNo}
        namaPenerima={nama}
        ekspedisi={
          selectedCourier
            ? `${selectedCourier.courier_name || selectedCourier.company} (${selectedCourier.courier_service_name})`
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span>{" "}
                <span className="font-light text-neutral-500 ml-1">
                  FASHION
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0 rounded-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Kembali Ke Keranjang</span>
            <span className="sm:hidden">Keranjang</span>
          </Link>
        </div>
      </header>

      {/* FORM CHECKOUT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          PEMBAYARAN & CHECKOUT
        </h1>

        <form
          onSubmit={handlePay}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs rounded-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <User className="w-4 h-4 text-neutral-800" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
                  DATA PENERIMA
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    NAMA PENERIMA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    NO WHATSAPP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1 relative" ref={cityDropdownRef}>
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                  ALAMAT TUJUAN{" "}
                  <span className="text-red-500">*(KETIK MIN. 3 HURUF)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={searchCityInput}
                    onChange={handleCitySearchChange}
                    onFocus={() =>
                      cityResults.length > 0 && setShowCityDropdown(true)
                    }
                    placeholder="Contoh: Kecamatan / Kabupaten / Kota"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 pr-9 rounded-2xs"
                  />
                  {isSearchingCity && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                    </div>
                  )}
                </div>

                {showCityDropdown && cityResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-300 shadow-xl z-50 max-h-52 overflow-y-auto rounded-2xs">
                    {cityResults.map((c, idx) => (
                      <div
                        key={`${c.city_id}-${idx}`}
                        onClick={() => handleSelectCity(c)}
                        className="p-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-none text-left"
                      >
                        <p className="text-xs font-bold text-neutral-900">
                          {c.type ? `${c.type} ` : ""}
                          {c.city_name}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          Provinsi: {c.province} • Kodepos:{" "}
                          {c.postal_code || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                  DETAIL ALAMAT LENGKAP <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, nomor bangunan, patokan..."
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
                />
              </div>
            </div>

            <div className="bg-white border border-neutral-200 shadow-xs rounded-xs overflow-hidden">
              <div className="bg-[#F1F3F5] p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-neutral-800">
                  <span>
                    Dikirim dari:{" "}
                    <strong className="text-neutral-950 font-bold">
                      Tulungagung
                    </strong>
                  </span>
                </div>

                <div className="relative" ref={courierDropdownRef}>
                  {!isClient ? (
                    <div className="bg-neutral-400 text-white text-xs font-bold px-4 py-2.5 rounded-2xs flex items-center justify-between gap-3 min-w-[200px]">
                      <span>PILIH JASA KIRIM</span>
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        isLoadingShipping || shippingOptions.length === 0
                      }
                      onClick={() =>
                        setShowCourierDropdown(!showCourierDropdown)
                      }
                      className="bg-[#0F2137] hover:bg-[#182F4D] text-white text-xs font-bold px-4 py-2.5 rounded-2xs flex items-center justify-between gap-3 min-w-[200px] shadow-xs cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed"
                    >
                      {isLoadingShipping ? (
                        <div className="flex items-center gap-2 mx-auto">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Memuat Tarif...</span>
                        </div>
                      ) : selectedCourier ? (
                        <>
                          <span className="truncate uppercase tracking-wide">
                            {selectedCourier.courier_name ||
                              selectedCourier.company}{" "}
                            {selectedCourier.courier_service_name} (
                            {selectedCourier.duration})
                          </span>
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        </>
                      ) : (
                        <>
                          <span>PILIH JASA KIRIM</span>
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  )}

                  {showCourierDropdown && shippingOptions.length > 0 && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-w-[90vw] bg-white border border-neutral-300 shadow-2xl rounded-2xs z-50 py-1 max-h-64 overflow-y-auto">
                      {shippingOptions.map((opt, idx) => (
                        <div
                          key={`${opt.company}-${opt.courier_service_name}-${idx}`}
                          onClick={() => {
                            setSelectedCourier(opt);
                            setShowCourierDropdown(false);
                          }}
                          className={`px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            (selectedCourier?.courier_name ||
                              selectedCourier?.company) ===
                              (opt.courier_name || opt.company) &&
                            selectedCourier?.courier_service_name ===
                              opt.courier_service_name
                              ? "bg-neutral-100 font-bold text-neutral-950"
                              : "hover:bg-neutral-50 text-neutral-800"
                          }`}
                        >
                          <div>
                            <p className="uppercase">
                              {opt.courier_name || opt.company}{" "}
                              {opt.courier_service_name} ({opt.duration})
                            </p>
                          </div>
                          <span className="font-bold shrink-0 ml-2 text-neutral-950 font-mono">
                            Rp {opt.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LIST ITEM PRODUK */}
              <div className="p-4 sm:p-6 space-y-4">
                {checkoutItems.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">
                    Tidak ada produk terpilih untuk di-checkout.
                  </p>
                ) : (
                  checkoutItems.map((item: any) => {
                    const isGrosir = Boolean(item.is_grosir);
                    const minGrosir = Math.max(
                      1,
                      parseInt(String(item.min_grosir || 5), 10),
                    );
                    const currentQty = Math.max(
                      1,
                      parseInt(String(item.qty || 1), 10),
                    );
                    const minAllowed = isGrosir ? minGrosir : 1;

                    return (
                      <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-neutral-100 pb-4 last:border-none last:pb-0"
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <div className="relative w-16 h-20 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden rounded-2xs">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500">
                              {item.size || "All Size"} (
                              {item.color || "Default"})
                            </p>
                            <p className="text-xs font-bold text-amber-950 font-mono">
                              Rp{" "}
                              {Number(item.price || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveCheckoutItem(
                                item.id,
                                item.size,
                                item.color,
                              )
                            }
                            className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-2xs flex items-center justify-center transition cursor-pointer"
                            title="Hapus dari Checkout"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Tombol Kurang & Tambah Qty */}
                          <div className="flex items-center border border-neutral-300 rounded-2xs bg-white">
                            <button
                              type="button"
                              disabled={currentQty <= minAllowed}
                              onClick={() => handleUpdateQtyCheckout(item, -1)}
                              className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-neutral-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold font-mono text-neutral-800">
                              {currentQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQtyCheckout(item, 1)}
                              className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-neutral-300 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tulis Catatan Buat Penjual..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs sticky top-24 rounded-xs">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
                METODE PEMBAYARAN
              </h3>

              <div
                onClick={() => setSelectedBank("bca")}
                className="flex items-center justify-between p-3.5 border-2 border-neutral-950 bg-neutral-50 shadow-xs cursor-pointer rounded-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-6 shrink-0 bg-white border border-neutral-200 flex items-center justify-center rounded-2xs">
                    <Image
                      src="/BCA.png"
                      alt="Bank BCA"
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Bank BCA
                    </span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
                      Transfer Manual
                    </span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  RINCIAN PESANAN
                </h4>
                <div className="space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between items-center text-neutral-700">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Total Berat Pesanan</span>
                    </span>
                    <span className="font-semibold text-neutral-900 font-mono">
                      {totalWeight} Gram ({totalWeightKg} Kg)
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-neutral-900 font-mono">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Ongkos Kirim (
                      {selectedCourier
                        ? (
                            selectedCourier.courier_name ||
                            selectedCourier.company
                          ).toUpperCase()
                        : "Kurir"}
                      )
                    </span>
                    <span className="font-semibold text-neutral-900 font-mono">
                      {isLoadingShipping
                        ? "Menghitung..."
                        : selectedCourier
                          ? "Rp " + shippingFee.toLocaleString("id-ID")
                          : "Pilih Kurir"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span>Biaya Packing</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                        {totalWeightKg} kg (Rp 3.000/kg)
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900 font-mono">
                      Rp {packingFee.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Total Tagihan</span>
                    <span className="text-base font-bold text-neutral-950 font-mono">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {!isClient ? (
                <div className="w-full bg-neutral-400 text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md text-center rounded-2xs">
                  MEMPROSES PESANAN...
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={
                    !selectedCourier ||
                    isLoadingShipping ||
                    isSubmittingOrder ||
                    checkoutItems.length === 0
                  }
                  className={`w-full text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition flex items-center justify-center gap-2 rounded-2xs ${
                    !selectedCourier ||
                    isLoadingShipping ||
                    isSubmittingOrder ||
                    checkoutItems.length === 0
                      ? "bg-neutral-400 cursor-not-allowed"
                      : "bg-neutral-950 hover:bg-black cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  {isSubmittingOrder && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {isSubmittingOrder
                      ? "MEMPROSES PESANAN..."
                      : "BAYAR SEKARANG"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
