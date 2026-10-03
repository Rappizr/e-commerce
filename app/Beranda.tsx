"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  ArrowRight,
  MapPin,
  Navigation,
  Clock,
  Building2,
  ExternalLink,
  Tag,
  PackageCheck,
  Maximize2,
  Eye,
  Loader2,
  Package,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { useKeranjang } from "./penyimpanan/KeranjangContext";
import { useAuth } from "./penyimpanan/authcontext";
import Footer from "./Footer";
import { supabase } from "./penyimpanan/supabase";

interface ToastItem {
  id: string | number;
  title: string;
  price: number;
  image: string;
}

interface VariantItem {
  id: number;
  product_id: number;
  warna: string;
  ukuran: string;
  stok: number;
}

export default function Beranda() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedProductToast, setAddedProductToast] = useState<ToastItem | null>(
    null,
  );
  const [showAllGrosir, setShowAllGrosir] = useState(false);

  const [showWaTooltip, setShowWaTooltip] = useState(true);
  const [zoomTestimoni, setZoomTestimoni] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [testimoniList, setTestimoniList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchError, setIsFetchError] = useState(false);

  // Transition state untuk pencarian tanpa lag UI
  const [, startTransition] = useTransition();

  // State sinkronisasi auth & anti-hydration mismatch
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [unpaidCount, setUnpaidCount] = useState<number>(0);

  // State Modal Pop-up Quick Add to Cart
  const [activeQuickProduct, setActiveQuickProduct] = useState<any | null>(
    null,
  );
  const [quickVariants, setQuickVariants] = useState<VariantItem[]>([]);
  const [isLoadingQuickVariants, setIsLoadingQuickVariants] = useState(false);
  const [quickColor, setQuickColor] = useState<string>("");
  const [quickQty, setQuickQty] = useState<number>(1);

  const {
    cartItems = [],
    tambahKeKeranjang,
    totalCount,
  } = (useKeranjang() as any) || {};
  const { isLoggedIn, user: authContextUser } = useAuth();

  // 1. Sinkronisasi Sesi Pengguna
  useEffect(() => {
    let isMounted = true;
    setHasMounted(true);

    const checkUnpaidOrders = async (uid: string) => {
      if (!uid) return;
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid)
          .eq("status", "Menunggu Pembayaran");

        if (!error && count !== null && isMounted) {
          setUnpaidCount(count);
        }
      } catch (err) {
        console.error("Gagal cek pesanan belum bayar:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setIsUserLoggedIn(true);
        localStorage.setItem("almaco_user_email", session.user.email || "");
        localStorage.setItem("almaco_user_id", session.user.id);
        checkUnpaidOrders(session.user.id);
      } else {
        const localEmail = localStorage.getItem("almaco_user_email");
        const localId = localStorage.getItem("almaco_user_id");
        if (localEmail || localId) {
          setIsUserLoggedIn(true);
          if (localId) checkUnpaidOrders(localId);
        } else {
          setIsUserLoggedIn(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setIsUserLoggedIn(true);
        localStorage.setItem("almaco_user_email", session.user.email || "");
        localStorage.setItem("almaco_user_id", session.user.id);
        checkUnpaidOrders(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setIsUserLoggedIn(false);
        setUnpaidCount(0);
        localStorage.removeItem("almaco_user_email");
        localStorage.removeItem("almaco_user_id");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isUserAuthenticated = Boolean(
    hasMounted && (isUserLoggedIn || isLoggedIn || Boolean(authContextUser)),
  );

  const totalCartCount =
    totalCount !== undefined
      ? totalCount
      : cartItems.reduce((acc: number, item: any) => acc + (item.qty || 1), 0);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (targetId === "beranda") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // 2. FETCH DATA SUPABASE AMAN TANPA CRASH TIMEOUT PROMISE.RACE
  const fetchDataFromSupabase = async () => {
    setIsLoading(true);
    setIsFetchError(false);

    try {
      const [prodRes, testRes] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, nama, kategori, harga, stok, berat, warna, ukuran, gambar_utama, is_grosir, min_grosir, harga_grosir",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("testimonials")
          .select("id, foto_url")
          .eq("tayang", true)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (prodRes.error) {
        throw prodRes.error;
      }

      if (prodRes.data) {
        const mapped = prodRes.data.map((p: any) => {
          const isGrosir = p.is_grosir === true || p.is_grosir === "true";
          const minG = Number(p.min_grosir || 5);
          const realStock = Number(p.stok || 0);

          let warnaArray: string[] = [];
          if (Array.isArray(p.warna)) {
            warnaArray = p.warna;
          } else if (typeof p.warna === "string") {
            try {
              warnaArray = JSON.parse(p.warna);
            } catch {
              warnaArray = p.warna.split(",").map((s: string) => s.trim());
            }
          }

          if (warnaArray.length === 0) {
            warnaArray = [isGrosir ? "Seri Mix (Campur Warna)" : "Default"];
          }

          return {
            id: Number(p.id),
            nama: p.nama || "Tanpa Nama",
            kategori: p.kategori || "Umum",
            harga: Number(p.harga || 0),
            stok: realStock,
            berat: Number(p.berat || 100),
            is_grosir: isGrosir,
            min_grosir: minG,
            harga_grosir: isGrosir
              ? Number(p.harga_grosir || p.harga || 0)
              : null,
            gambarUtama:
              p.gambar_utama ||
              "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop",
            warna: warnaArray,
            ukuran:
              Array.isArray(p.ukuran) && p.ukuran.length > 0
                ? p.ukuran[0]
                : p.ukuran || "All Size",
          };
        });

        setProducts(mapped);

        const extractedCats = Array.from(
          new Set(mapped.map((p: any) => p.kategori)),
        ).filter(Boolean);
        if (extractedCats.length > 0) {
          setCategories(["Semua", ...(extractedCats as string[])]);
        }
      }

      if (testRes && !testRes.error && testRes.data) {
        setTestimoniList(testRes.data);
      }
    } catch (e: any) {
      console.error("Fetch Supabase Error:", e);
      setIsFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromSupabase();
  }, []);

  const triggerToast = (item: any) => {
    setAddedProductToast({
      id: item.id,
      title: item.nama,
      price: item.harga,
      image: item.gambarUtama,
    });

    const timer = setTimeout(() => {
      setAddedProductToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  };

  const handleOpenQuickModal = async (item: any) => {
    if (item.stok <= 0) return;
    setActiveQuickProduct(item);
    setIsLoadingQuickVariants(true);

    const isGrosir = Boolean(item.is_grosir);
    const minG = Number(item.min_grosir || 5);

    if (isGrosir) {
      setQuickColor("Seri Mix (Campur Warna)");
      setQuickQty(minG);
    } else {
      const defaultColor = item.warna[0] || "Default";
      setQuickColor(defaultColor);
      setQuickQty(1);
    }

    try {
      const { data: vData } = await supabase
        .from("product_variants")
        .select("id, product_id, warna, ukuran, stok")
        .eq("product_id", Number(item.id));

      const loadedVariants: VariantItem[] = (vData || []).map((v: any) => ({
        id: Number(v.id),
        product_id: Number(v.product_id),
        warna: String(v.warna || "Default").trim(),
        ukuran: String(v.ukuran || item.ukuran || "All Size").trim(),
        stok: Number(v.stok ?? 0),
      }));

      setQuickVariants(loadedVariants);

      if (!isGrosir && loadedVariants.length > 0) {
        const availableColor =
          item.warna.find((w: string) => {
            const match = loadedVariants.find(
              (v) => v.warna.toUpperCase() === w.trim().toUpperCase(),
            );
            return match ? match.stok > 0 : false;
          }) || item.warna[0];

        setQuickColor(availableColor || "Default");
      }
    } catch (err) {
      console.error("Gagal load varian modal quick:", err);
      setQuickVariants([]);
    } finally {
      setIsLoadingQuickVariants(false);
    }
  };

  const getQuickColorStock = (colorName: string): number => {
    if (!quickVariants || quickVariants.length === 0) {
      return activeQuickProduct?.stok || 0;
    }
    const target = colorName.trim().toUpperCase();
    const match = quickVariants.find(
      (v) => v.warna.trim().toUpperCase() === target,
    );
    return match ? Number(match.stok || 0) : activeQuickProduct?.stok || 0;
  };

  const isQuickProductGrosir = Boolean(activeQuickProduct?.is_grosir);
  const activeColorStock = getQuickColorStock(quickColor);
  const totalStockAll = activeQuickProduct?.stok || 0;
  const currentAvailableStock = isQuickProductGrosir
    ? totalStockAll
    : activeColorStock;

  const minAllowedQuickQty = isQuickProductGrosir
    ? Number(activeQuickProduct?.min_grosir || 5)
    : 1;

  const quickStepQty = isQuickProductGrosir ? minAllowedQuickQty : 1;

  useEffect(() => {
    if (currentAvailableStock > 0) {
      if (quickQty > currentAvailableStock) {
        if (isQuickProductGrosir) {
          const maxMultiples =
            Math.floor(currentAvailableStock / minAllowedQuickQty) *
            minAllowedQuickQty;
          setQuickQty(Math.max(minAllowedQuickQty, maxMultiples));
        } else {
          setQuickQty(currentAvailableStock);
        }
      } else if (quickQty < minAllowedQuickQty) {
        setQuickQty(minAllowedQuickQty);
      }
    }
  }, [
    quickColor,
    currentAvailableStock,
    minAllowedQuickQty,
    isQuickProductGrosir,
  ]);

  const handleConfirmAddToCart = () => {
    if (!activeQuickProduct || currentAvailableStock <= 0) return;

    const minGrosir = Number(activeQuickProduct.min_grosir || 5);
    const finalColor = isQuickProductGrosir
      ? "Seri Mix (Campur Warna)"
      : quickColor;

    if (typeof tambahKeKeranjang === "function") {
      tambahKeKeranjang(
        {
          id: activeQuickProduct.id,
          title: activeQuickProduct.nama,
          price: Number(activeQuickProduct.harga || 0),
          rawPrice: Number(activeQuickProduct.harga || 0),
          image: activeQuickProduct.gambarUtama,
          size: activeQuickProduct.ukuran || "All Size",
          color: finalColor,
          weight: Number(activeQuickProduct.berat || 100),
          is_grosir: isQuickProductGrosir,
          min_grosir: isQuickProductGrosir ? minGrosir : null,
          harga_grosir: isQuickProductGrosir
            ? Number(activeQuickProduct.harga)
            : null,
        },
        quickQty,
      );
    }

    triggerToast({
      ...activeQuickProduct,
      harga: Number(activeQuickProduct.harga || 0),
    });
    setActiveQuickProduct(null);
  };

  const heroBanners = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const noWhatsapp = "6285138472520";
  const pesanWhatsapp =
    "Halo Admin ALMACO FASHION, saya tertarik dan ingin bertanya mengenai katalog produk terbaru.";
  const waUrl = `https://wa.me/${noWhatsapp}?text=${encodeURIComponent(
    pesanWhatsapp,
  )}`;
  const mapsUrl = "https://maps.app.goo.gl/6rg5xWuRDZvKg76i6";

  const brandTicker = Array(8).fill("ALMACO FASHION");
  const deliveryTicker = Array(8).fill("TESTIMONI & BUKTI PENGIRIMAN");

  const grosirProducts = products
    .filter((p) => p.is_grosir === true)
    .sort((a, b) => {
      const aIsHabis = Number(a.stok || 0) <= 0;
      const bIsHabis = Number(b.stok || 0) <= 0;
      if (aIsHabis && !bIsHabis) return 1;
      if (!aIsHabis && bIsHabis) return -1;
      return 0;
    });

  const defaultGrosirLimit = 4;
  const displayedGrosir = showAllGrosir
    ? grosirProducts
    : grosirProducts.slice(0, defaultGrosirLimit);

  const hasGrosirProducts = grosirProducts.length > 0;

  const filteredProducts = products
    .filter((p) => {
      const isEceran = hasGrosirProducts ? !p.is_grosir : true;

      const matchCategory =
        selectedCategory === "Semua" ||
        String(p.kategori || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(p.nama || "")
          .toLowerCase()
          .includes(query) ||
        String(p.kategori || "")
          .toLowerCase()
          .includes(query);

      return isEceran && matchCategory && matchSearch;
    })
    .sort((a, b) => {
      const aIsHabis = Number(a.stok || 0) <= 0;
      const bIsHabis = Number(b.stok || 0) <= 0;

      if (aIsHabis && !bIsHabis) return 1;
      if (!aIsHabis && bIsHabis) return -1;

      if (sortOption === "price-low") return a.harga - b.harga;
      if (sortOption === "price-high") return b.harga - a.harga;
      if (sortOption === "newest") return b.id - a.id;
      return 0;
    });

  return (
    <main
      id="beranda"
      className="min-h-screen bg-[#FAF8F5] text-neutral-900 antialiased selection:bg-amber-900 selection:text-white scroll-smooth relative flex flex-col justify-between overflow-x-hidden"
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth !important;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* NOTIFIKASI TOAST SUKSES MASUK KERANJANG */}
      {addedProductToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setAddedProductToast(null)}
          />

          <div className="relative z-10 w-full max-w-[400px] bg-white border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Berhasil Masuk Keranjang</span>
              </div>
              <button
                onClick={() => setAddedProductToast(null)}
                className="text-neutral-400 hover:text-neutral-900 p-1 transition-colors cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3.5 bg-[#FAF8F5] p-2.5 border border-stone-200 rounded-2xs">
              <div className="relative w-14 h-18 bg-neutral-200 border border-neutral-200 shrink-0 overflow-hidden rounded-2xs">
                <Image
                  src={addedProductToast.image}
                  alt={addedProductToast.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wide truncate">
                  {addedProductToast.title}
                </h4>
                <p className="text-xs font-bold text-amber-950 font-mono">
                  Rp {addedProductToast.price.toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                  Pesanan diperbarui di keranjang
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAddedProductToast(null)}
                className="w-full bg-white hover:bg-stone-50 text-neutral-800 border border-stone-300 text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors text-center cursor-pointer rounded-2xs"
              >
                Lanjut Belanja
              </button>
              <Link
                href="/keranjang"
                onClick={() => setAddedProductToast(null)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs cursor-pointer rounded-2xs"
              >
                <span>Lihat Keranjang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER UTAMA */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="w-full px-3.5 sm:px-8 lg:px-12 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <a
            href="#beranda"
            onClick={(e) => handleSmoothScroll(e, "beranda")}
            className="flex items-center gap-1.5 sm:gap-2 transition-all duration-300 hover:opacity-85 active:scale-95 min-w-0 group cursor-pointer"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950 truncate">
                <span className="font-black tracking-wider">ALMACO</span>
                <span className="font-light text-neutral-800 ml-1">
                  FASHION
                </span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </a>

          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-6 items-center relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => setSearchQuery(val));
              }}
              placeholder="CARI MODEL BUSANA..."
              className="w-full bg-[#FAF8F5] border border-stone-200 px-4 py-2 pr-9 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-amber-900 focus:bg-white transition-all duration-300 rounded-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-neutral-400 hover:text-neutral-900 transition-colors duration-200 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 shrink-0">
            <nav className="hidden lg:flex items-center space-x-6 text-xs tracking-[0.15em] uppercase font-bold text-neutral-700">
              <a
                href="#beranda"
                onClick={(e) => handleSmoothScroll(e, "beranda")}
                className="relative py-1 transition-colors duration-300 hover:text-amber-900 active:scale-95 group cursor-pointer"
              >
                <span>Beranda</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
              </a>

              {grosirProducts.length > 0 && (
                <a
                  href="#grosir-section"
                  onClick={(e) => handleSmoothScroll(e, "grosir-section")}
                  className="relative py-1 text-amber-900 transition-colors duration-300 hover:text-amber-950 active:scale-95 flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>Katalog Grosir</span>
                  <span className="bg-amber-800 text-white text-[9px] px-1.5 py-0.2 rounded-xs font-bold tracking-wider">
                    SERI
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-800 transition-all duration-300 ease-out group-hover:w-full" />
                </a>
              )}

              <a
                href="#lokasi"
                onClick={(e) => handleSmoothScroll(e, "lokasi")}
                className="relative py-1 transition-colors duration-300 hover:text-amber-900 active:scale-95 group cursor-pointer"
              >
                <span>Lokasi Butik</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
              </a>

              <a
                href="#testimoni"
                onClick={(e) => handleSmoothScroll(e, "testimoni")}
                className="relative py-1 transition-colors duration-300 hover:text-amber-900 active:scale-95 group cursor-pointer"
              >
                <span>Testimoni</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            </nav>

            <Link
              href="/keranjang"
              className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-1 text-neutral-800 hover:text-amber-900 transition-all duration-300 active:scale-90 group"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                {totalCartCount > 0 && (
                  <span className="sm:hidden absolute -top-1.5 -right-2 w-4 h-4 bg-amber-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-[0.15em] relative py-1">
                Keranjang
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
              </span>
              <span className="hidden sm:inline-flex items-center justify-center bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] transition-transform duration-300 group-hover:scale-110">
                {totalCartCount}
              </span>
            </Link>

            {/* TOMBOL PROFILE */}
            {isUserAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-1 text-neutral-800 hover:text-amber-900 transition-all duration-300 active:scale-95 text-xs font-bold uppercase tracking-[0.15em] group relative"
              >
                <div className="relative">
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110" />
                  {unpaidCount > 0 && (
                    <span className="sm:hidden absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 border-2 border-white rounded-full animate-ping" />
                  )}
                  {unpaidCount > 0 && (
                    <span className="sm:hidden absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 border-2 border-white rounded-full" />
                  )}
                </div>
                <span className="hidden sm:inline relative py-1">
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
                </span>

                {unpaidCount > 0 && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-bounce"
                    title={`${unpaidCount} pesanan menunggu pembayaran`}
                  >
                    <span>{unpaidCount} Belum Bayar</span>
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 p-1 text-neutral-800 hover:text-amber-900 transition-all duration-300 active:scale-95 text-xs font-bold uppercase tracking-[0.15em] group"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline relative py-1">
                  Masuk
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 transition-all duration-300 ease-out group-hover:w-full" />
                </span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-900 border border-stone-300 hover:border-neutral-900 transition-all duration-200 active:scale-90 rounded-2xs relative"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  {unpaidCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 border border-white rounded-full" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3.5 space-y-2.5 shadow-lg transition-all duration-300">
            <div className="relative w-full mb-2 md:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CARI BUSANA..."
                className="w-full bg-[#FAF8F5] border border-stone-200 px-3 py-1.5 pr-8 text-xs tracking-wider uppercase rounded-2xs"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2 pointer-events-none" />
              )}
            </div>
            <a
              href="#beranda"
              onClick={(e) => handleSmoothScroll(e, "beranda")}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-stone-100 active:bg-stone-50 transition-colors"
            >
              Beranda
            </a>
            {grosirProducts.length > 0 && (
              <a
                href="#grosir-section"
                onClick={(e) => handleSmoothScroll(e, "grosir-section")}
                className="block py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-100 active:bg-stone-50 transition-colors"
              >
                Katalog Grosir (Seri Paket)
              </a>
            )}
            <a
              href="#lokasi"
              onClick={(e) => handleSmoothScroll(e, "lokasi")}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-stone-100 active:bg-stone-50 transition-colors"
            >
              Lokasi Butik
            </a>
            <a
              href="#testimoni"
              onClick={(e) => handleSmoothScroll(e, "testimoni")}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-stone-100 active:bg-stone-50 transition-colors"
            >
              Testimoni
            </a>
            <Link
              href={isUserAuthenticated ? "/profile" : "/auth"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 active:bg-stone-50 transition-colors"
            >
              <span>
                {isUserAuthenticated ? "Profile Saya" : "Masuk / Daftar Akun"}
              </span>
              {isUserAuthenticated && unpaidCount > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  {unpaidCount} Belum Dibayar
                </span>
              )}
            </Link>
          </div>
        )}
      </header>

      {/* HERO BANNER SLIDER */}
      <section className="relative w-full bg-[#FAF8F5] overflow-hidden leading-none select-none">
        <div
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${currentHeroIndex * 100}%)` }}
        >
          {heroBanners.map((bannerSrc, index) => (
            <div
              key={index}
              className="w-full shrink-0 relative aspect-[16/6] sm:aspect-[21/9]"
            >
              <Image
                src={bannerSrc}
                alt={`Almaco Fashion Banner ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* TICKER BRAND */}
      <div className="w-full bg-[#F3EFEA] border-y border-stone-200/80 py-2 sm:py-2.5 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-amber-900/60 mx-3 sm:mx-8 select-none whitespace-nowrap"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* SECTION GROSIR TERPISAH */}
      {!isLoading && !isFetchError && grosirProducts.length > 0 && (
        <section
          id="grosir-section"
          className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12 pt-6 sm:pt-10"
        >
          <div className="bg-[#F8F5EE] border border-amber-800/20 p-3.5 sm:p-7 shadow-xs relative rounded-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-300/60 pb-3 mb-4 sm:mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wider">
                  <span className="bg-amber-900 text-amber-100 text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 tracking-widest rounded-2xs flex items-center gap-1 shadow-xs">
                    <Tag className="w-3 h-3 text-amber-300" />
                    KATALOG GROSIR / SERI
                  </span>
                  <span className="text-amber-800/40">•</span>
                  <span className="text-amber-900 font-bold">
                    Paket Seri Campur Warna
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-serif font-bold uppercase tracking-tight text-neutral-950">
                  Paket Grosir Seri Konveksi ALMACO
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                Menampilkan {displayedGrosir.length} dari{" "}
                {grosirProducts.length} Produk Seri
              </span>
            </div>

            <div className="mb-4 bg-white border border-stone-200/90 p-2.5 sm:p-3 rounded-2xs shadow-2xs">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-neutral-900">
                <PackageCheck className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  Paket seri otomatis mendapatkan warna berbeda/campur sesuai
                  foto katalog
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {displayedGrosir.map((item, idx) => {
                const isHabis = Number(item.stok || 0) <= 0;
                const minG = Number(item.min_grosir || 5);
                const jumlahSeri = Math.floor(Number(item.stok || 0) / minG);

                return (
                  <div
                    key={`grosir-${item.id}`}
                    className={`group bg-white border overflow-hidden flex flex-col justify-between transition-all duration-300 rounded-xs ${
                      isHabis
                        ? "border-stone-200 opacity-75"
                        : "border-amber-800/30 hover:shadow-md hover:border-amber-900"
                    }`}
                  >
                    <Link
                      href={`/product-detail?id=${item.id}`}
                      className="block relative"
                    >
                      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                        <Image
                          src={item.gambarUtama}
                          alt={item.nama}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          priority={idx < 2}
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />

                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[7.5px] sm:text-[9.5px] uppercase font-bold tracking-wider bg-amber-900 text-amber-100 px-2 py-0.5 shadow-sm rounded-2xs z-10">
                          Min. {item.min_grosir} Pcs
                        </span>

                        <span
                          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[7.5px] sm:text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-sm rounded-2xs z-10 ${
                            isHabis
                              ? "bg-rose-600 text-white font-black"
                              : "bg-white/95 text-amber-950 border border-amber-200 font-mono"
                          }`}
                        >
                          {isHabis ? "Habis" : `Stok: ${item.stok} pcs`}
                        </span>
                      </div>

                      <div className="p-2 sm:p-4 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-800 font-bold block truncate">
                            {item.kategori}
                          </span>
                          {!isHabis && (
                            <span className="text-[8px] sm:text-[9.5px] font-bold text-neutral-500 font-mono shrink-0">
                              ({jumlahSeri} Seri Available)
                            </span>
                          )}
                        </div>

                        <h4 className="text-[11px] sm:text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:underline underline-offset-2">
                          {item.nama}
                        </h4>

                        <div className="pt-0.5 flex flex-col">
                          <span className="text-[8.5px] sm:text-[10px] text-neutral-500">
                            Harga Grosir Seri:
                          </span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[12px] sm:text-base font-bold text-amber-950 font-mono tracking-tight">
                              Rp {item.harga.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] sm:text-[10px] text-neutral-500 font-normal">
                              /pcs
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="px-2 pb-2 sm:px-4 sm:pb-4 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenQuickModal(item)}
                        disabled={isHabis}
                        className={`flex-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider py-1.5 sm:py-2 transition flex items-center justify-center gap-1 rounded-2xs ${
                          isHabis
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                            : "bg-neutral-950 hover:bg-amber-950 text-white cursor-pointer shadow-2xs active:scale-[0.98]"
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3 text-amber-300" />
                        <span>{isHabis ? "Stok Habis" : "Beli 1 Seri"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {grosirProducts.length > defaultGrosirLimit && (
              <div className="mt-6 sm:mt-8 pt-4 border-t border-stone-300/60 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllGrosir(!showAllGrosir)}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-950 text-neutral-900 hover:text-white border border-stone-300 hover:border-neutral-950 px-6 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-2xs cursor-pointer active:scale-95 rounded-2xs group"
                >
                  <span>
                    {showAllGrosir
                      ? "Sembunyikan Sebagian"
                      : `Lihat (${grosirProducts.length - defaultGrosirLimit}) Produk Grosir Lainnya`}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-800 group-hover:text-amber-300 transition-transform duration-300 ${
                      showAllGrosir ? "rotate-180" : "animate-bounce"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* KATALOG ECERAN UTAMA */}
      <section className="w-full px-3.5 sm:px-8 lg:px-12 py-6 sm:py-10 flex-1">
        <div className="relative flex items-center justify-center my-6 sm:my-10">
          <div className="w-full border-t border-stone-300/80" />
          <span className="absolute bg-[#FAF8F5] px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-neutral-800 whitespace-nowrap">
            KATALOG ECERAN SATUAN
          </span>
        </div>

        {/* Dropdown Filter */}
        <div className="flex flex-row items-center justify-between border-b border-stone-200 pb-3 sm:pb-4 mb-5 sm:mb-8 gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 shrink-0 hidden xs:inline">
              Kategori:
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:min-w-[190px] text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white border border-stone-300 py-2 sm:py-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:border-amber-900 cursor-pointer shadow-2xs text-neutral-900 rounded-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "Semua" ? "SEMUA KATEGORI" : cat.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial justify-end">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 shrink-0 hidden xs:inline">
              Urutkan:
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:min-w-[190px] text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white border border-stone-300 py-2 sm:py-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:border-amber-900 cursor-pointer shadow-2xs text-neutral-900 rounded-2xs"
              >
                <option value="default">Paling Sesuai</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="newest">Produk Terbaru</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* PENANGANAN TAMPILAN: LOADING, ERROR KONEKSI, KOSONG, ATAU PRODUK */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white border border-stone-200 rounded-xs shadow-xs my-4">
            <Loader2 className="w-9 h-9 text-amber-900 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">
                Memuat Katalog Produk...
              </p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                Mohon tunggu sebentar, data sedang diunduh
              </p>
            </div>
          </div>
        ) : isFetchError ? (
          <div className="bg-rose-50/50 border border-rose-200 p-8 sm:p-12 text-center space-y-3 my-4 rounded-xs shadow-xs">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-rose-600" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-950">
                Koneksi Internet Buruk / Gagal Memuat Data
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-600 max-w-sm mx-auto">
                Terjadi kendala saat menghubungkan ke database server. Periksa
                jaringan internet Anda lalu coba muat ulang.
              </p>
            </div>
            <button
              onClick={() => fetchDataFromSupabase()}
              className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 transition shadow-sm cursor-pointer active:scale-95 rounded-2xs"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Coba Muat Ulang</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-stone-200 p-8 sm:p-12 text-center text-neutral-400 space-y-2.5 shadow-xs my-4 rounded-xs">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                {searchQuery || selectedCategory !== "Semua"
                  ? "Produk Tidak Ditemukan"
                  : "Belum Ada Produk Eceran"}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">
                {searchQuery || selectedCategory !== "Semua"
                  ? "Tidak ada busana eceran yang sesuai dengan filter pencarian ini."
                  : "Katalog pakaian eceran akan otomatis tampil setelah diunggah melalui Panel Admin."}
              </p>
            </div>
            {(searchQuery || selectedCategory !== "Semua") && (
              <button
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 mt-1 hover:bg-black transition cursor-pointer active:scale-95 rounded-2xs"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
            {filteredProducts.map((item, idx) => {
              const isHabis = Number(item.stok || 0) <= 0;

              return (
                <div
                  key={item.id}
                  className={`group bg-white border overflow-hidden flex flex-col justify-between transition-all duration-300 rounded-xs ${
                    isHabis
                      ? "border-stone-200 opacity-75"
                      : "border-stone-200 hover:shadow-md"
                  }`}
                >
                  <div>
                    <Link
                      href={`/product-detail?id=${item.id}`}
                      className="block relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden"
                    >
                      <Image
                        src={item.gambarUtama}
                        alt={item.nama}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={idx < 4}
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />

                      <span
                        className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-2xs shadow-2xs z-10 ${
                          isHabis
                            ? "bg-rose-600 text-white font-black"
                            : "bg-white/95 text-neutral-900 border border-stone-200 font-mono"
                        }`}
                      >
                        {isHabis ? "Habis" : `Sisa: ${item.stok} pcs`}
                      </span>
                    </Link>

                    <div className="p-2 sm:p-3.5 space-y-0.5 sm:space-y-1">
                      <span className="text-[7.5px] sm:text-[9px] uppercase tracking-widest text-amber-900/60 font-semibold block truncate">
                        {item.kategori}
                      </span>
                      <Link href={`/product-detail?id=${item.id}`}>
                        <h4 className="text-[11px] sm:text-xs font-medium text-neutral-900 line-clamp-1 hover:underline underline-offset-2">
                          {item.nama}
                        </h4>
                      </Link>
                      <p className="text-[11px] sm:text-sm font-bold text-neutral-950 tracking-tight font-mono pt-0.5">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-stretch border-t border-stone-200 bg-stone-50">
                    <Link
                      href={`/product-detail?id=${item.id}`}
                      className="w-9 sm:w-11 py-2 sm:py-2.5 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-stone-100 transition border-r border-stone-200 shrink-0"
                      title="Lihat Detail Produk"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenQuickModal(item)}
                      disabled={isHabis}
                      className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 min-w-0 ${
                        isHabis
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                          : "bg-neutral-950 hover:bg-amber-950 text-white cursor-pointer active:scale-95"
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">
                        {isHabis ? "Stok Habis" : "+ Keranjang"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL POP-UP QUICK ADD TO CART */}
      {activeQuickProduct &&
        (() => {
          const isGrosir = Boolean(activeQuickProduct.is_grosir);
          const minGrosir = Number(activeQuickProduct.min_grosir || 5);
          const unitPrice = Number(activeQuickProduct.harga || 0);
          const subtotal = unitPrice * quickQty;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div
                className="fixed inset-0"
                onClick={() => setActiveQuickProduct(null)}
              />

              <div className="relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white border border-stone-200 shadow-2xl p-4 sm:p-5 space-y-3.5 animate-in zoom-in-95 duration-200 rounded-xs">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-12 h-16 bg-neutral-100 border border-stone-200 shrink-0 rounded-2xs overflow-hidden">
                      <Image
                        src={activeQuickProduct.gambarUtama}
                        alt={activeQuickProduct.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8.5px] uppercase font-bold tracking-wider text-amber-900 block">
                        {isGrosir
                          ? `Paket Seri (Min. ${minGrosir} Pcs)`
                          : "Produk Eceran"}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                        {activeQuickProduct.nama}
                      </h4>

                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-sm font-mono font-black text-amber-950">
                          Rp {unitPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          /pcs
                        </span>
                      </div>

                      <span
                        className={`text-[9.5px] block font-medium ${
                          currentAvailableStock > 0
                            ? "text-emerald-800"
                            : "text-rose-600 font-bold"
                        }`}
                      >
                        {isLoadingQuickVariants ? (
                          <span className="inline-flex items-center gap-1 text-stone-400">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Cek stok...
                          </span>
                        ) : currentAvailableStock > 0 ? (
                          isGrosir ? (
                            `Total Stok Seri: ${totalStockAll} pcs`
                          ) : (
                            `Stok Warna ${quickColor}: ${activeColorStock} pcs`
                          )
                        ) : isGrosir ? (
                          "Stok Seri Habis"
                        ) : (
                          `Warna ${quickColor} Habis`
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveQuickProduct(null)}
                    className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#FAF8F5] border border-stone-200 text-xs rounded-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">
                    Ukuran Model:
                  </span>
                  <span className="font-bold text-neutral-950 text-[11px] font-mono bg-white px-2 py-0.5 border border-stone-300 rounded-2xs">
                    {activeQuickProduct.ukuran || "All Size"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs uppercase">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                      Warna Busana:
                    </span>
                    <span className="text-[10px] font-bold text-neutral-900">
                      {isGrosir ? "Seri Campur Warna Otomatis" : quickColor}
                    </span>
                  </div>

                  {isGrosir ? (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-2xs flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-950 leading-relaxed">
                        Paket seri otomatis mendapatkan{" "}
                        <strong>{minGrosir} warna berbeda/campur</strong> sesuai
                        stok seri di katalog (tidak dapat memilih warna satuan).
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuickProduct.warna.map((warna: string) => {
                        const stokWarna = getQuickColorStock(warna);
                        const isHabis = stokWarna <= 0;
                        const isSelected =
                          quickColor.trim().toUpperCase() ===
                          warna.trim().toUpperCase();

                        return (
                          <button
                            key={warna}
                            type="button"
                            disabled={isHabis}
                            onClick={() => setQuickColor(warna)}
                            className={`px-2.5 py-1 text-[10px] font-bold border transition rounded-2xs flex items-center gap-1 ${
                              isHabis
                                ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through opacity-60"
                                : isSelected
                                  ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs cursor-pointer"
                                  : "bg-white text-neutral-700 border-stone-300 hover:border-neutral-900 cursor-pointer"
                            }`}
                          >
                            <span>{warna}</span>
                            <span
                              className={`text-[8px] font-mono ${
                                isSelected ? "text-amber-200" : "text-stone-400"
                              }`}
                            >
                              ({isHabis ? "Habis" : stokWarna})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                      Jumlah Pesan:
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      Total:{" "}
                      <strong className="text-amber-950 font-bold">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border border-stone-300 bg-stone-50 px-2 py-0.5 rounded-2xs">
                    <button
                      type="button"
                      disabled={
                        quickQty <= minAllowedQuickQty ||
                        currentAvailableStock <= 0
                      }
                      onClick={() => {
                        setQuickQty((prev) =>
                          Math.max(minAllowedQuickQty, prev - quickStepQty),
                        );
                      }}
                      className="p-1 hover:text-amber-900 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs">
                      {quickQty}
                    </span>
                    <button
                      type="button"
                      disabled={
                        quickQty + quickStepQty > currentAvailableStock ||
                        currentAvailableStock <= 0
                      }
                      onClick={() => {
                        setQuickQty((prev) =>
                          Math.min(currentAvailableStock, prev + quickStepQty),
                        );
                      }}
                      className="p-1 hover:text-amber-900 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  disabled={currentAvailableStock <= 0}
                  className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-md rounded-2xs flex items-center justify-center gap-1.5 ${
                    currentAvailableStock > 0
                      ? "bg-neutral-950 hover:bg-amber-950 text-white cursor-pointer active:scale-[0.99]"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {currentAvailableStock <= 0
                      ? isGrosir
                        ? "Stok Seri Habis"
                        : `Warna ${quickColor} Habis`
                      : isGrosir
                        ? `Beli Paket Seri (${quickQty} Pcs)`
                        : "Masukkan ke Keranjang"}
                  </span>
                </button>
              </div>
            </div>
          );
        })()}

      {/* LOKASI BUTIK & WORKSHOP */}
      <section
        id="lokasi"
        className="w-full bg-[#F5F2EC] border-t border-stone-200 py-8 sm:py-14"
      >
        <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-6 sm:mb-8">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-amber-900/60 font-bold">
              KUNJUNGI KAMI
            </p>
            <h2 className="text-lg sm:text-2xl font-serif uppercase tracking-tight text-neutral-950">
              LOKASI BUTIK & WORKSHOP
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              Distributor & Butik Busana Batik Indonesia kami di Tulungagung.
              Melayani pesanan ke seluruh Indonesia.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-stone-200 shadow-xs overflow-hidden rounded-xs">
            <div className="flex flex-row items-stretch min-h-[220px] sm:min-h-[300px]">
              <div className="w-[48%] sm:w-[45%] p-3.5 sm:p-6 flex flex-col justify-between border-r border-stone-200 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950 truncate">
                        ALMACO FASHION
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-neutral-400">
                        Distributor & Butik Busana Batik Indonesia
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-neutral-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[9px] sm:text-[10px] text-neutral-900 uppercase font-bold">
                          Alamat:
                        </strong>
                        <p className="text-neutral-500 leading-tight text-[9px] sm:text-[11px]">
                          Dusun Jati, RT 02 / RW 02, Mergayu, Bandung,
                          Tulungagung
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[9px] sm:text-[10px] text-neutral-900 uppercase font-bold">
                          Jam Buka:
                        </strong>
                        <p className="text-neutral-500 leading-tight text-[9px] sm:text-[11px]">
                          Senin – Sabtu: 08.00–21.00 WIB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider py-2 sm:py-2.5 px-2 transition shadow-xs active:scale-95 rounded-2xs"
                  >
                    <Navigation className="w-3 h-3 text-amber-300" />
                    <span>BUKA DI GOOGLE MAPS</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              </div>

              <div className="w-[52%] sm:w-[55%] bg-neutral-100 relative">
                <iframe
                  title="Peta Lokasi ALMACO FASHION"
                  src="https://maps.google.com/maps?q=RQM9%2BHRH%20Mergayu%2C%20Kabupaten%20Tulungagung%2C%20Jawa%20Timur&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 absolute inset-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TESTIMONI PELANGGAN */}
      {testimoniList.length > 0 && (
        <>
          <div className="w-full bg-[#1F1D1A] text-white py-2.5 overflow-hidden border-y border-stone-800">
            <div className="animate-marquee flex items-center">
              {deliveryTicker
                .concat(deliveryTicker)
                .map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-amber-200/70 mx-4 select-none whitespace-nowrap"
                  >
                    ✦ {item}
                  </span>
                ))}
            </div>
          </div>

          <section
            id="testimoni"
            className="bg-[#EFEBE4] py-10 sm:py-16 border-b border-stone-200 overflow-hidden w-full"
          >
            <div className="w-full px-4 sm:px-8 mb-6 sm:mb-10 text-center">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-amber-900 font-bold mb-1.5">
                BUKTI PENGIRIMAN & KEPUASAN ASLI
              </p>
              <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase tracking-tight text-neutral-950">
                TESTIMONI PELANGGAN ALMACO
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mt-1">
                Arahkan kursor atau klik foto untuk memperbesar bukti chat dan
                resi kiriman.
              </p>
            </div>

            <div className="w-full overflow-hidden py-2">
              <div className="animate-marquee-slow flex items-center">
                {testimoniList
                  .concat(testimoniList)
                  .map((item: any, idx: number) => (
                    <div
                      key={`marquee-${idx}`}
                      onClick={() => setZoomTestimoni(item.foto_url)}
                      className="w-[150px] sm:w-[200px] aspect-[9/16] relative bg-neutral-900 mx-2 sm:mx-3 shrink-0 overflow-hidden border border-stone-300 shadow-md group cursor-pointer rounded-xs transition-transform duration-300 hover:scale-[1.03] hover:border-amber-800"
                    >
                      <Image
                        src={item.foto_url}
                        alt={`Bukti Testimoni ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 150px, 200px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white/95 text-neutral-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                          <Maximize2 className="w-3 h-3 text-amber-900" />
                          <span>Perbesar</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />

      {/* TOMBOL MENGAPUNG WHATSAPP */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
        {showWaTooltip && (
          <div className="relative bg-white text-neutral-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-stone-200 max-w-[200px] sm:max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={() => setShowWaTooltip(false)}
              className="absolute -top-2 -right-2 bg-neutral-900 hover:bg-black text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Tutup pesan"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <p className="text-xs sm:text-sm font-medium leading-snug text-neutral-700">
              Halo, kami siap membantu Anda.
            </p>

            <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-b border-r border-stone-200 rotate-45" />
          </div>
        )}

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp Admin"
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-white"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </a>
      </div>
    </main>
  );
}
