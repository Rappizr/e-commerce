"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ExternalLink,
  LogOut,
  CreditCard,
  MessageSquareQuote,
  Wallet,
  Menu,
  X,
  Loader2,
} from "lucide-react";

import DashboardComponent from "./component/dashboard";
import PesananComponent from "./component/pesanan";
import ProdukComponent from "./component/produk";
import TestimoniComponent from "./component/testimoni";
import VerifikasiBayarComponent from "./component/verifikasi-bayar";
import KeuanganComponent from "./component/keuangan";
import AdminLoginForm from "./login/AdminLoginForm";
import { supabase } from "../penyimpanan/supabase";

type MenuType =
  | "dashboard"
  | "pesanan"
  | "produk"
  | "pembayaran"
  | "testimoni"
  | "keuangan";

export default function AdminMainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState<string>("Administrator");
  const [activeMenu, setActiveMenu] = useState<MenuType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Badge indikator pesanan butuh verifikasi
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Helper untuk membersihkan cache lokal
  const clearAdminAuthCache = () => {
    localStorage.removeItem("almaco_admin_auth");
    localStorage.removeItem("almaco_admin_user");
    localStorage.removeItem("almaco_admin_login_at");
  };

  // Hitung pesanan yang membutuhkan tindakan admin
  const fetchBadgeCounts = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .or("status.eq.Menunggu Verifikasi,status.eq.Menunggu Pembayaran");

      if (!error && count !== null) {
        setPendingOrdersCount(count);
      }
    } catch {
      // Diamkan jika terjadi masalah koneksi sementara
    }
  }, []);

  // Verifikasi otentikasi ketat via Server Supabase Auth & Tabel Profiles
  const checkStrictAuth = useCallback(async () => {
    try {
      // 1. Ambil user tervalidasi kriptografis langsung dari server Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sesi tidak valid / kadaluarsa");
      }

      // 2. Murni validasi role 'admin' dari database (tanpa hardcoded email)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, nama")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        throw new Error("Akses ditolak: Hanya untuk role admin");
      }

      setIsAuthenticated(true);
      if (profile?.nama) setAdminName(profile.nama);
      fetchBadgeCounts();
    } catch {
      await supabase.auth.signOut();
      clearAdminAuthCache();
      setIsAuthenticated(false);
    }
  }, [fetchBadgeCounts]);

  useEffect(() => {
    checkStrictAuth();

    // Listener Perubahan State Autentikasi
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          clearAdminAuthCache();
          setIsAuthenticated(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await checkStrictAuth();
        }
      },
    );

    // Listener Realtime Supabase untuk memperbarui badge pesanan otomatis
    const ordersChannel = supabase
      .channel("admin-orders-badge-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchBadgeCounts();
        },
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(ordersChannel);
    };
  }, [checkStrictAuth, fetchBadgeCounts]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearAdminAuthCache();
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowLogoutModal(false);
    }
  };

  // 1. Tampilan loading saat memvalidasi otorisasi
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Memverifikasi Hak Akses...
        </span>
      </div>
    );
  }

  // 2. Jika bukan admin terverifikasi, kunci di halaman login
  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={checkStrictAuth} />;
  }

  // Helper untuk merender tombol menu sidebar
  const renderNavButton = (
    menu: MenuType,
    label: string,
    Icon: React.ElementType,
    badgeCount?: number,
    isPulseBadge?: boolean,
  ) => {
    const isActive = activeMenu === menu;
    return (
      <button
        type="button"
        onClick={() => {
          setActiveMenu(menu);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-2xs transition-all cursor-pointer ${
          isActive
            ? "bg-neutral-950 text-amber-200 font-bold shadow-2xs"
            : "text-neutral-600 hover:bg-[#FAF8F5]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span
            className={`px-1.5 py-0.5 text-white font-mono text-[9.5px] font-bold rounded-full ${
              isPulseBadge ? "bg-rose-600 animate-pulse" : "bg-amber-800"
            }`}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  // 3. Panel Dashboard Utama
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row text-neutral-900 font-sans overflow-x-hidden relative selection:bg-amber-900 selection:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR ADMIN */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Almaco"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-xs uppercase tracking-tight text-neutral-950">
                  <span className="font-black tracking-wider">ALMACO</span>
                  <span className="font-light text-neutral-800 ml-1">
                    FASHION
                  </span>
                </div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest block truncate max-w-[130px]">
                  {adminName}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-stone-400 hover:text-neutral-900 cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {renderNavButton("dashboard", "Dashboard", LayoutDashboard)}
            {renderNavButton(
              "pesanan",
              "Pesanan",
              ShoppingBag,
              pendingOrdersCount,
            )}
            {renderNavButton(
              "pembayaran",
              "Konfirmasi Bayar",
              CreditCard,
              pendingOrdersCount,
              true,
            )}
            {renderNavButton("keuangan", "Keuangan & Kas", Wallet)}
            {renderNavButton("produk", "Produk", Package)}
            {renderNavButton("testimoni", "Testimoni", MessageSquareQuote)}
          </nav>
        </div>

        <div className="p-3 border-t border-stone-100 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:bg-[#FAF8F5] rounded-2xs"
          >
            <span>Lihat Toko</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-rose-600 hover:bg-rose-50 rounded-2xs text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* HEADER & KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-neutral-800 border border-stone-200 rounded-2xs cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
              {activeMenu === "dashboard" && "Ringkasan Statistik Toko"}
              {activeMenu === "pesanan" && "Kelola Daftar Pesanan & Pengiriman"}
              {activeMenu === "pembayaran" && "Verifikasi Bukti Transfer"}
              {activeMenu === "keuangan" && "Buku Kas & Laporan Keuangan"}
              {activeMenu === "produk" && "Kelola Katalog Produk"}
              {activeMenu === "testimoni" && "Kelola Galeri Foto Testimoni"}
            </h1>
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terautentikasi</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeMenu === "dashboard" && (
            <DashboardComponent
              onNavigate={(m) => setActiveMenu(m as MenuType)}
            />
          )}
          {activeMenu === "pesanan" && <PesananComponent />}
          {activeMenu === "pembayaran" && <VerifikasiBayarComponent />}
          {activeMenu === "keuangan" && <KeuanganComponent />}
          {activeMenu === "produk" && <ProdukComponent />}
          {activeMenu === "testimoni" && <TestimoniComponent />}
        </main>
      </div>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 p-6 max-w-sm w-full text-center space-y-4 rounded-xs shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-neutral-500">
              Yakin ingin keluar dari sesi admin?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold uppercase rounded-2xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-2xs cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
