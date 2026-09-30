"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  Scale,
  CheckSquare,
  Square,
  AlertTriangle,
  Package,
  AlertCircle,
} from "lucide-react";
import Footer from "../Footer";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import { supabase } from "../penyimpanan/supabase";

export default function KeranjangPage() {
  const router = useRouter();

  const {
    cartItems = [],
    updateQty,
    removeItem,
    hapusItem,
    hapusItemDaftar,
  } = (useKeranjang() as any) || {};

  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>([]);
  const [stockMap, setStockMap] = useState<{ [key: string]: number }>({});
  const [validProductIds, setValidProductIds] = useState<number[]>([]);
  const [isVerifyingStocks, setIsVerifyingStocks] = useState(true);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const getItemKey = (item: any) =>
    `${item.id}-${item.size}-${item.color}-${item.is_grosir ? "grosir" : "ecer"}`;

  // Validasi real-time status produk dan ketersediaan stok
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setStockMap({});
      setValidProductIds([]);
      setIsVerifyingStocks(false);
      return;
    }

    const verifyCartWithDatabase = async () => {
      setIsVerifyingStocks(true);
      try {
        const productIds = Array.from(
          new Set(
            cartItems.map((item: any) => Number(item.id)).filter(Boolean),
          ),
        );

        if (productIds.length === 0) {
          setIsVerifyingStocks(false);
          return;
        }

        // 1. Cek keberadaan produk di tabel products
        const { data: activeProducts } = await supabase
          .from("products")
          .select("id, stok")
          .in("id", productIds);

        const existingIds = (activeProducts || []).map((p: any) =>
          Number(p.id),
        );
        setValidProductIds(existingIds);

        // 2. Ambil data stok varian terbaru
        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("product_id, warna, ukuran, stok")
          .in("product_id", productIds);

        const map: { [key: string]: number } = {};

        cartItems.forEach((item: any) => {
          const itemKey = getItemKey(item);
          const pId = Number(item.id);

          if (!existingIds.includes(pId)) {
            map[itemKey] = 0;
            return;
          }

          const isGrosir = Boolean(item.is_grosir);

          if (isGrosir) {
            // KHUSUS GROSIR: Ambil stok langsung dari data master products (tidak di-reduce)
            const matchedProd = (activeProducts || []).find(
              (p: any) => Number(p.id) === pId,
            );
            map[itemKey] = Number(matchedProd?.stok ?? item.stok ?? 0);
          } else {
            // KHUSUS ECERAN: TETAP PERSIS SEPERTI SEBELUMNYA (TIDAK DIUBAH)
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

            map[itemKey] = match ? Number(match.stok ?? 0) : 0;
          }
        });

        setStockMap(map);

        setSelectedItemKeys((prev) =>
          prev.filter((key) => {
            const item = cartItems.find((ci: any) => getItemKey(ci) === key);
            if (!item) return false;
            const stock = map[key] ?? 0;
            const isExist = existingIds.includes(Number(item.id));
            return isExist && stock > 0;
          }),
        );
      } catch (err) {
        console.error("Gagal memeriksa stok database:", err);
      } finally {
        setIsVerifyingStocks(false);
      }
    };

    verifyCartWithDatabase();
  }, [cartItems]);

  const handleDelete = (id: string | number, size?: string, color?: string) => {
    if (typeof hapusItem === "function") {
      hapusItem(id, size, color);
    } else if (typeof removeItem === "function") {
      removeItem(id, size, color);
    }
  };

  const handleClearUnavailableItems = () => {
    const unavailableItems = cartItems.filter((item: any) => {
      const itemKey = getItemKey(item);
      const isExist = validProductIds.includes(Number(item.id));
      const available = stockMap[itemKey] ?? 0;
      return !isExist || available <= 0;
    });

    if (typeof hapusItemDaftar === "function") {
      hapusItemDaftar(unavailableItems);
    } else {
      unavailableItems.forEach((i: any) => handleDelete(i.id, i.size, i.color));
    }
    setSelectedItemKeys([]);
  };

  // Penambahan dan pengurangan kuantitas:
  // Grosir melompat kelipatan seri (+min_grosir / -min_grosir), Eceran 1 per 1
  const handleUpdateQty = (item: any, direction: number) => {
    const itemKey = getItemKey(item);
    const currentAvailableStock = stockMap[itemKey] ?? 0;
    const isGrosir = Boolean(item.is_grosir);
    const minGrosir = Number(item.min_grosir || 5);
    const stepChange = isGrosir ? minGrosir : 1;
    const minAllowed = isGrosir ? minGrosir : 1;

    const change = direction > 0 ? stepChange : -stepChange;
    const targetQty = item.qty + change;

    // Jika di bawah batas minimum
    if (targetQty < minAllowed) {
      if (!isGrosir && targetQty <= 0) {
        handleDelete(item.id, item.size, item.color);
      }
      return;
    }

    if (direction > 0 && targetQty > currentAvailableStock) {
      setStockWarning(
        `Stok untuk ${item.title} ${isGrosir ? "(Seri)" : `(${item.color})`} hanya tersisa ${currentAvailableStock} pcs.`,
      );
      return;
    }

    const price = Number(item.price || item.rawPrice || 0);
    if (typeof updateQty === "function") {
      updateQty(item.id, item.size, item.color, targetQty, price);
    }
  };

  const toggleSelectItem = (key: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const availableItemsCount = cartItems.filter((item: any) => {
    const key = getItemKey(item);
    return (
      validProductIds.includes(Number(item.id)) && (stockMap[key] ?? 0) > 0
    );
  }).length;

  const isAllSelected =
    availableItemsCount > 0 && selectedItemKeys.length === availableItemsCount;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemKeys([]);
    } else {
      const validKeys = cartItems
        .filter((item: any) => {
          const key = getItemKey(item);
          return (
            validProductIds.includes(Number(item.id)) &&
            (stockMap[key] ?? 0) > 0
          );
        })
        .map(getItemKey);
      setSelectedItemKeys(validKeys);
    }
  };

  const selectedCartItems = cartItems.filter((item: any) => {
    const key = getItemKey(item);
    return selectedItemKeys.includes(key);
  });

  const selectedSubtotal = selectedCartItems.reduce(
    (acc: number, item: any) => acc + Number(item.price || 0) * item.qty,
    0,
  );

  const selectedTotalWeight = selectedCartItems.reduce(
    (acc: number, item: any) => acc + (Number(item.weight) || 100) * item.qty,
    0,
  );

  const hasUnavailableItems = cartItems.some((item: any) => {
    const key = getItemKey(item);
    return (
      !validProductIds.includes(Number(item.id)) || (stockMap[key] ?? 0) <= 0
    );
  });

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) return;

    for (const item of selectedCartItems) {
      const itemKey = getItemKey(item);
      const isExist = validProductIds.includes(Number(item.id));
      const available = stockMap[itemKey] ?? 0;

      if (!isExist) {
        setStockWarning(`Produk "${item.title}" sudah tidak tersedia di toko.`);
        return;
      }

      if (available <= 0) {
        setStockWarning(`Stok untuk "${item.title}" sudah habis terjual.`);
        return;
      }

      if (item.qty > available) {
        setStockWarning(
          `Jumlah pesanan untuk ${item.title} ${item.is_grosir ? "(Seri)" : `(${item.color})`} melebihi sisa stok (${available} pcs). Mohon kurangi jumlahnya.`,
        );
        return;
      }
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "almaco_checkout_items",
        JSON.stringify(selectedCartItems),
      );
    }

    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white justify-between overflow-x-hidden">
      {/* POPUP PERINGATAN */}
      {stockWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setStockWarning(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                  Perhatian Stok
                </h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Informasi Ketersediaan
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed bg-[#FAF8F5] p-3 border border-stone-200 rounded-2xs">
              {stockWarning}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setStockWarning(null)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition rounded-2xs cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
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
            <div className="leading-tight truncate">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black tracking-wider">ALMACO</span>{" "}
                <span className="font-light text-neutral-800 ml-1">
                  FASHION
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-stone-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Lanjut Belanja</span>
            <span className="xs:hidden">Belanja</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="space-y-1 mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-amber-900/70 font-bold">
            KERANJANG SAYA
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight text-neutral-950">
            Daftar Pesanan Belanja
          </h1>
        </div>

        {/* NOTIFIKASI JIKA ADA BARANG HABIS / DIHAPUS */}
        {!isVerifyingStocks && hasUnavailableItems && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                Beberapa produk di keranjang Anda <strong>sudah habis</strong>{" "}
                atau <strong>tidak lagi tersedia</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearUnavailableItems}
              className="self-start sm:self-auto px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider rounded-2xs transition shrink-0 cursor-pointer"
            >
              Hapus Barang Tidak Tersedia
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white border border-stone-200 p-8 sm:p-14 text-center space-y-4 my-6 shadow-xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Keranjang Belanja Anda Kosong
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
                Temukan berbagai koleksi daster, gamis, setcel, dan paket seri
                grosir kami.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-neutral-950 hover:bg-amber-950 text-white text-[11px] sm:text-xs uppercase tracking-widest font-bold py-3 px-6 sm:px-8 transition shadow-xs mt-2"
            >
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* DAFTAR ITEM */}
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              {/* BAR KONTROL PILIH SEMUA */}
              <div className="bg-white border border-stone-200 px-4 py-3 flex items-center justify-between shadow-2xs text-xs font-bold uppercase tracking-wider text-neutral-800">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={availableItemsCount === 0}
                  className="flex items-center gap-2.5 hover:text-amber-900 transition cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-amber-900" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                  <span>
                    Pilih Semua ({selectedItemKeys.length}/{availableItemsCount}
                    )
                  </span>
                </button>

                {selectedItemKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const selectedItems = cartItems.filter((i: any) =>
                        selectedItemKeys.includes(getItemKey(i)),
                      );
                      if (typeof hapusItemDaftar === "function") {
                        hapusItemDaftar(selectedItems);
                      } else {
                        selectedItems.forEach((i: any) =>
                          handleDelete(i.id, i.size, i.color),
                        );
                      }
                      setSelectedItemKeys([]);
                    }}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih</span>
                  </button>
                )}
              </div>

              {/* LIST PRODUK */}
              {cartItems.map((item: any) => {
                const itemKey = getItemKey(item);
                const isSelected = selectedItemKeys.includes(itemKey);
                const itemUnitWeight = Number(item.weight) || 100;

                const isProductExist = validProductIds.includes(
                  Number(item.id),
                );
                const availableStock = stockMap[itemKey] ?? (item.stok || 0);
                const isStockEmpty = !isProductExist || availableStock <= 0;

                const isGrosir = Boolean(item.is_grosir);
                const minGrosir = Number(item.min_grosir || 5);
                const minAllowed = isGrosir ? minGrosir : 1;
                const unitPrice = Number(item.price || 0);
                const itemSubtotal = unitPrice * item.qty;

                return (
                  <div
                    key={itemKey}
                    className={`bg-white border transition-all p-3.5 sm:p-5 flex flex-col space-y-3 shadow-2xs rounded-xs ${
                      isStockEmpty
                        ? "border-stone-200 bg-stone-50/60 opacity-60"
                        : isSelected
                          ? "border-amber-900 ring-1 ring-amber-900/20"
                          : "border-stone-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          disabled={isStockEmpty}
                          onClick={() =>
                            toggleSelectItem(itemKey, !isStockEmpty)
                          }
                          className="p-1 text-neutral-700 hover:text-amber-900 transition shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-amber-900" />
                          ) : (
                            <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                          )}
                        </button>

                        <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 shrink-0 overflow-hidden border border-stone-200 rounded-2xs">
                          <Image
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop"
                            }
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          {isStockEmpty && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1 text-center">
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                                {!isProductExist ? "Dihapus" : "Habis"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {isGrosir ? (
                              <span className="bg-amber-900 text-amber-100 text-[8px] font-bold px-1.5 py-0.2 rounded-2xs">
                                SERI GROSIR
                              </span>
                            ) : (
                              <span className="bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-2xs">
                                ECERAN
                              </span>
                            )}
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 line-clamp-1">
                              {item.title}
                            </h3>
                          </div>

                          <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">
                            Ukuran:{" "}
                            <strong className="text-neutral-800">
                              {item.size || "All Size"}
                            </strong>{" "}
                            | Warna:{" "}
                            <strong className="text-neutral-800">
                              {item.color || "Default"}
                            </strong>
                          </p>

                          <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
                            {!isProductExist ? (
                              <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Produk Tidak Tersedia di Katalog
                              </span>
                            ) : isStockEmpty ? (
                              <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Stok Habis
                              </span>
                            ) : (
                              <>
                                <span className="text-neutral-600 font-mono">
                                  Tersedia: {availableStock} pcs
                                </span>
                                <span className="text-stone-300">•</span>
                                <span className="flex items-center gap-1 text-neutral-500">
                                  <Scale className="w-3 h-3 text-stone-400" />
                                  <span>{itemUnitWeight} gr/pcs</span>
                                </span>
                              </>
                            )}
                          </div>

                          <div className="pt-0.5 flex items-baseline gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-950 font-mono">
                              Rp {unitPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              / pcs
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* JUMLAH & SUBTOTAL */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                        <div className="flex items-center border border-stone-300 rounded-xs bg-white">
                          <button
                            type="button"
                            disabled={isStockEmpty || item.qty <= minAllowed}
                            onClick={() => handleUpdateQty(item, -1)}
                            className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-stone-300 cursor-pointer active:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-800 font-mono">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            disabled={
                              isStockEmpty ||
                              item.qty + (isGrosir ? minGrosir : 1) >
                                availableStock
                            }
                            onClick={() => handleUpdateQty(item, 1)}
                            className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-stone-300 cursor-pointer active:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm font-bold font-mono text-neutral-950 min-w-20 text-right">
                          Rp {itemSubtotal.toLocaleString("id-ID")}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id, item.size, item.color)
                          }
                          className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Hapus dari Keranjang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isGrosir && !isStockEmpty && (
                      <div className="pt-1">
                        <div className="p-2 bg-amber-50/80 border border-amber-200/90 rounded-xs flex items-center justify-between text-amber-950 text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-amber-800" />
                            <span>
                              Paket Seri Grosir Otomatis Campur Warna (
                              {item.qty} Pcs)
                            </span>
                          </div>
                          <span className="bg-amber-900 text-amber-100 px-2 py-0.5 rounded-2xs font-mono text-[9px]">
                            MIN. {minGrosir} PCS
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RINGKASAN BELANJA KANAN */}
            <div className="lg:col-span-4 bg-white border border-stone-200 p-5 sm:p-6 space-y-5 shadow-xs sticky top-24 rounded-xs">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-stone-100 pb-3 sm:pb-4">
                RINGKASAN BELANJA
              </h2>

              <div className="space-y-2.5 text-xs uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Produk Terpilih</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {selectedItemKeys.length} Item
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    Rp {selectedSubtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-stone-400" />
                    <span>Total Berat Terpilih</span>
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {selectedTotalWeight} Gram
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Biaya Ongkir</span>
                  <span>Dihitung di Checkout</span>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Total Sementara</span>
                  <span className="text-base font-bold text-amber-950 font-mono">
                    Rp {selectedSubtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={selectedItemKeys.length === 0}
                className={`w-full text-xs tracking-[0.2em] font-bold uppercase py-3.5 sm:py-4 flex items-center justify-center gap-2 transition shadow-md text-center rounded-2xs ${
                  selectedItemKeys.length > 0
                    ? "bg-neutral-950 hover:bg-amber-950 text-white cursor-pointer"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                }`}
              >
                <span>
                  {selectedItemKeys.length > 0
                    ? "Lanjut Ke Checkout"
                    : "Pilih Produk Dulu"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
