"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "../Footer";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import PembayaranComponent from "./component/pembayaran";
import { supabase } from "../penyimpanan/supabase";

import ModalStockWarning from "./component/ModalStockWarning";
import ModalAuthCheckout from "./component/ModalAuthCheckout";
import DataPenerimaForm, { RajaOngkirCity } from "./component/DataPenerimaForm";
import JasaKirimDropdown, {
  CourierPricing,
} from "./component/JasaKirimDropdown";
import CheckoutItemList from "./component/CheckoutItemList";
import RingkasanMetode from "./component/RingkasanMetode";

function getProductStock(item: any): number {
  const possibleStock =
    item.stock ?? item.stok ?? item.tersedia ?? item.available ?? item.maxStock;

  if (possibleStock !== undefined && possibleStock !== null) {
    const parsed = parseInt(String(possibleStock), 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function formatCityDisplay(
  cityName: string,
  postalCode?: string,
  villageName?: string,
): string {
  if (!cityName) return "";

  const parts = cityName
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const uniqueParts: string[] = [];
  parts.forEach((part) => {
    if (
      !uniqueParts.some((item) => item.toLowerCase() === part.toLowerCase())
    ) {
      uniqueParts.push(part);
    }
  });

  let result = uniqueParts.join(", ");

  if (
    villageName &&
    villageName.trim() !== "" &&
    !result.toLowerCase().includes(villageName.toLowerCase())
  ) {
    const cleanVillage = villageName
      .replace(/^kecamatan\s+/gi, "")
      .trim()
      .toUpperCase();
    result = `Kecamatan ${cleanVillage}, ${result}`;
  }

  if (postalCode && postalCode !== "-" && !result.includes(postalCode)) {
    result = `${result}, ${postalCode}`;
  }

  return result;
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
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // User Auth State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const lookupCityId = useCallback(
    async (queryCity: string, postalCode?: string, villageName?: string) => {
      try {
        const searchQuery =
          postalCode && postalCode.trim() !== "" && postalCode.trim() !== "-"
            ? postalCode.trim()
            : queryCity;

        if (!searchQuery) return;

        const cleanName = searchQuery
          .replace(/^(wilayah terdaftar|default)/gi, "")
          .replace(/(kabupaten|kota|\(.*?\))/gi, "")
          .trim();

        if (cleanName.length < 3) return;

        const res = await fetch(
          `/api/rajaongkir?q=${encodeURIComponent(cleanName)}`,
        );
        const data = await res.json();

        if (data?.results && data.results.length > 0) {
          let match = data.results[0];

          if (
            postalCode &&
            postalCode.trim() !== "-" &&
            postalCode.trim() !== ""
          ) {
            const exactZipMatch = data.results.find(
              (c: RajaOngkirCity) =>
                String(c.postal_code) === String(postalCode).trim(),
            );
            if (exactZipMatch) match = exactZipMatch;
          }

          setSelectedCityId(match.city_id);

          const rawName = `${match.type ? match.type + " " : ""}${match.city_name}${match.province ? ", " + match.province : ""}`;
          const formattedDisplay = formatCityDisplay(
            rawName,
            match.postal_code || postalCode,
            villageName,
          );
          setSearchCityInput(formattedDisplay);
        }
      } catch (e) {
        console.error("Gagal auto lookup kota:", e);
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        let user: any = null;

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          user = session.user;
        } else {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }

        const fallbackEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("almaco_user_email")
            : null;
        const fallbackId =
          typeof window !== "undefined"
            ? localStorage.getItem("almaco_user_id")
            : null;

        const resolvedUid = user?.id || fallbackId;
        const resolvedEmail = user?.email || fallbackEmail;

        if (!resolvedUid && !resolvedEmail) {
          if (isMounted) setShowAuthModal(true);
          return;
        }

        if (resolvedUid && isMounted) setCurrentUserId(resolvedUid);

        let query = supabase.from("profiles").select("*");
        if (resolvedUid) {
          query = query.eq("id", resolvedUid);
        } else if (resolvedEmail) {
          query = query.eq("email", resolvedEmail);
        }

        const { data: profile } = await query.maybeSingle();

        if (!isMounted) return;

        let selectedAddr: any = null;
        if (
          profile?.daftar_alamat &&
          Array.isArray(profile.daftar_alamat) &&
          profile.daftar_alamat.length > 0
        ) {
          selectedAddr =
            profile.daftar_alamat.find((a: any) => a.isDefault) ||
            profile.daftar_alamat[0];
        } else if (typeof window !== "undefined") {
          const localAddr = localStorage.getItem("almaco_saved_addresses");
          if (localAddr) {
            try {
              const parsed = JSON.parse(localAddr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                selectedAddr =
                  parsed.find((a: any) => a.isDefault) || parsed[0];
              }
            } catch (e) {}
          }
        }

        const resolvedNama =
          selectedAddr?.recipient ||
          profile?.nama ||
          user?.user_metadata?.nama ||
          (resolvedEmail ? resolvedEmail.split("@")[0] : "");

        const resolvedPhone =
          selectedAddr?.phone ||
          profile?.no_hp ||
          user?.user_metadata?.no_hp ||
          "";

        const resolvedAlamat = selectedAddr?.address || profile?.alamat || "";

        if (resolvedNama) setNama(resolvedNama);
        if (resolvedPhone) setWhatsapp(resolvedPhone);
        if (resolvedAlamat) setAlamat(resolvedAlamat);

        const village =
          selectedAddr?.village ||
          selectedAddr?.kelurahan ||
          selectedAddr?.label ||
          "";

        if (selectedAddr?.city_id) {
          setSelectedCityId(selectedAddr.city_id);
          const formattedDisplay = formatCityDisplay(
            selectedAddr.city || "",
            selectedAddr.postalCode,
            village,
          );
          setSearchCityInput(formattedDisplay);
        } else {
          let targetCityQuery = "";
          if (
            selectedAddr?.city &&
            !selectedAddr.city.includes("Wilayah Terdaftar")
          ) {
            targetCityQuery = selectedAddr.city;
          } else if (resolvedAlamat) {
            const parts = resolvedAlamat.split(",");
            targetCityQuery =
              parts.length > 1
                ? parts[1].replace(/\(.*?\)/g, "").trim()
                : resolvedAlamat.replace(/\(.*?\)/g, "").trim();
          }

          if (selectedAddr?.postalCode || targetCityQuery) {
            lookupCityId(targetCityQuery, selectedAddr?.postalCode, village);
          }
        }
      } catch (err) {
        console.error("Gagal load profile di checkout:", err);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [lookupCityId]);

  useEffect(() => {
    let rawItemsToSanitize: any[] = [];

    try {
      const savedCheckoutItems = sessionStorage.getItem(
        "almaco_checkout_items",
      );
      if (savedCheckoutItems) {
        const parsed = JSON.parse(savedCheckoutItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawItemsToSanitize = parsed;
        }
      }
    } catch (e) {
      console.error("Gagal membaca session storage checkout:", e);
    }

    if (
      rawItemsToSanitize.length === 0 &&
      fullCartItems &&
      fullCartItems.length > 0
    ) {
      rawItemsToSanitize = fullCartItems;
    }

    if (rawItemsToSanitize.length === 0) {
      setCheckoutItems([]);
      return;
    }

    const syncRealtimeStock = async () => {
      try {
        const productIds = Array.from(
          new Set(
            rawItemsToSanitize
              .map((item: any) => Number(item.id))
              .filter(Boolean),
          ),
        );

        if (productIds.length === 0) return;

        const { data: activeProducts } = await supabase
          .from("products")
          .select("id, stok")
          .in("id", productIds);

        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("product_id, warna, ukuran, stok")
          .in("product_id", productIds);

        const sanitized = rawItemsToSanitize.map((item: any) => {
          const pId = Number(item.id);
          const matchedInCart = fullCartItems.find(
            (c: any) =>
              String(c.id) === String(item.id) &&
              String(c.size || "")
                .trim()
                .toUpperCase() ===
                String(item.size || "")
                  .trim()
                  .toUpperCase() &&
              String(c.color || "")
                .trim()
                .toUpperCase() ===
                String(item.color || "")
                  .trim()
                  .toUpperCase(),
          );

          const isGrosir = Boolean(item.is_grosir ?? matchedInCart?.is_grosir);
          const minGrosir = Math.max(
            1,
            parseInt(
              String(item.min_grosir ?? matchedInCart?.min_grosir ?? 5),
              10,
            ),
          );

          let realStock = 0;

          if (isGrosir) {
            const matchedProd = (activeProducts || []).find(
              (p: any) => Number(p.id) === pId,
            );
            realStock = Number(
              matchedProd?.stok ?? item.stok ?? item.stock ?? 0,
            );
          } else {
            const targetColor = String(item.color || "Default")
              .trim()
              .toUpperCase();
            const targetSize = String(item.size || "All Size")
              .trim()
              .toUpperCase();

            const match = (variantsData || []).find(
              (v: any) =>
                Number(v.product_id) === pId &&
                String(v.ukuran || "")
                  .trim()
                  .toUpperCase() === targetSize &&
                (String(v.warna || "")
                  .trim()
                  .toUpperCase() === targetColor ||
                  String(v.warna || "")
                    .trim()
                    .toUpperCase() === "DEFAULT"),
            );

            realStock = match
              ? Number(match.stok ?? 0)
              : getProductStock(matchedInCart || item);
          }

          const currentQty = parseInt(
            String(item.qty || (isGrosir ? minGrosir : 1)),
            10,
          );
          const validQty = Math.min(
            Math.max(isGrosir ? minGrosir : 1, currentQty),
            realStock > 0 ? realStock : currentQty,
          );

          return {
            ...item,
            is_grosir: isGrosir,
            min_grosir: minGrosir,
            qty: validQty,
            price: Number(item.price || item.rawPrice || 0),
            stock: realStock,
          };
        });

        setCheckoutItems(sanitized);
      } catch (err) {
        console.error("Gagal sinkronisasi stok realtime di checkout:", err);
      }
    };

    syncRealtimeStock();
  }, [fullCartItems]);

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

  const handleUpdateQtyCheckout = (item: any, direction: number) => {
    const isGrosir = Boolean(item.is_grosir);
    const minGrosir = Math.max(1, parseInt(String(item.min_grosir || 5), 10));
    const minAllowed = isGrosir ? minGrosir : 1;
    const maxStock = getProductStock(item);

    const currentQty = Math.max(
      minAllowed,
      parseInt(String(item.qty || minAllowed), 10),
    );
    const step = isGrosir ? minGrosir : 1;
    let nextQty = direction > 0 ? currentQty + step : currentQty - step;

    if (nextQty < minAllowed) return;

    if (direction > 0 && nextQty > maxStock) {
      setStockWarning(
        `Stok untuk ${item.title} ${isGrosir ? "(Seri Grosir)" : `(${item.color || "Default"})`} hanya tersisa ${maxStock} pcs.`,
      );
      return;
    }

    if (nextQty === currentQty) return;

    const price = Number(item.price || item.rawPrice || 0);
    if (typeof updateQtyContext === "function") {
      updateQtyContext(item.id, item.size, item.color, nextQty, price);
    }

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
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 400);
  };

  const handleSelectCity = (city: RajaOngkirCity) => {
    const rawName = `${city.type ? city.type + " " : ""}${city.city_name}${city.province ? ", " + city.province : ""}`;
    const formatted = formatCityDisplay(rawName, city.postal_code);
    setSearchCityInput(formatted);
    setSelectedCityId(city.city_id);
    setShowCityDropdown(false);
    fetchRates(city.city_id);
  };

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

    for (const item of checkoutItems) {
      const maxStock = getProductStock(item);
      if (item.qty > maxStock) {
        setStockWarning(
          `Jumlah pesanan untuk ${item.title} melebihi sisa stok yang tersedia (${maxStock} pcs). Mohon sesuaikan jumlah pesanan Anda.`,
        );
        return;
      }
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
            user_id: currentUserId || null,
            invoice_no: inv,
            nama_pembeli: nama.trim(),
            no_hp: formattedWa,
            alamat_lengkap: `${alamat.trim()} (${searchCityInput})`,
            status: "Menunggu Pembayaran",
            subtotal: subtotal,
            ongkir: calculatedTotalOngkir,
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
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden relative">
      <ModalStockWarning
        warningMessage={stockWarning}
        onClose={() => setStockWarning(null)}
      />

      <ModalAuthCheckout show={showAuthModal} />

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

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          PEMBAYARAN & CHECKOUT
        </h1>

        <form
          onSubmit={handlePay}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          <div className="lg:col-span-7 space-y-6">
            <DataPenerimaForm
              currentUserId={currentUserId}
              nama={nama}
              setNama={setNama}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              alamat={alamat}
              setAlamat={setAlamat}
              searchCityInput={searchCityInput}
              handleCitySearchChange={handleCitySearchChange}
              cityResults={cityResults}
              isSearchingCity={isSearchingCity}
              showCityDropdown={showCityDropdown}
              setShowCityDropdown={setShowCityDropdown}
              handleSelectCity={handleSelectCity}
              cityDropdownRef={cityDropdownRef}
            />

            <div className="bg-white border border-neutral-200 shadow-xs rounded-xs overflow-hidden">
              <JasaKirimDropdown
                isClient={isClient}
                isLoadingShipping={isLoadingShipping}
                shippingOptions={shippingOptions}
                selectedCourier={selectedCourier}
                setSelectedCourier={setSelectedCourier}
                showCourierDropdown={showCourierDropdown}
                setShowCourierDropdown={setShowCourierDropdown}
                courierDropdownRef={courierDropdownRef}
              />

              <CheckoutItemList
                checkoutItems={checkoutItems}
                catatan={catatan}
                setCatatan={setCatatan}
                handleRemoveCheckoutItem={handleRemoveCheckoutItem}
                handleUpdateQtyCheckout={handleUpdateQtyCheckout}
                getProductStock={getProductStock}
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <RingkasanMetode
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              totalWeight={totalWeight}
              totalWeightKg={totalWeightKg}
              subtotal={subtotal}
              shippingFee={shippingFee}
              packingFee={packingFee}
              total={total}
              selectedCourier={selectedCourier}
              isLoadingShipping={isLoadingShipping}
              isClient={isClient}
              isSubmittingOrder={isSubmittingOrder}
              checkoutItemsLength={checkoutItems.length}
            />
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
