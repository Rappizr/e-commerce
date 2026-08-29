'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Loader2
} from 'lucide-react';

import DashboardComponent from './component/dashboard';
import PesananComponent from './component/pesanan';
import ProdukComponent from './component/produk';
import TestimoniComponent from './component/testimoni';
import VerifikasiBayarComponent from './component/verifikasi-bayar';
import KeuanganComponent from './component/keuangan';
import AdminLoginPage from './login/page';
import { supabase } from '../penyimpanan/supabase'; 

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. Verifikasi sesi aman langsung ke Supabase Auth & Tabel Profiles
  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setIsAuthenticated(false);
        return;
      }

      // Pastikan akun memiliki role admin di database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error && profile?.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();

    // Listener jika status login/logout berubah secara real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN') {
        checkAdminAuth();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Logout resmi dari sesi Supabase
  const handleConfirmLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('almaco_admin_auth');
      localStorage.removeItem('almaco_admin_user');
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleSelectMenu = (menu: 'dashboard' | 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan') => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F4F3EE] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Memeriksa Hak Akses Admin...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={() => checkAdminAuth()} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col md:flex-row text-neutral-900 font-sans overflow-x-hidden relative">
      
      {/* SIDEBAR OVERLAY MOBILE */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <div>
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-black tracking-widest uppercase text-neutral-950 block">ALMACO</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold uppercase">PANEL ADMIN</span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            <button
              onClick={() => handleSelectMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'dashboard' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectMenu('pesanan')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'pesanan' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesanan</span>
            </button>

            <button
              onClick={() => handleSelectMenu('pembayaran')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'pembayaran' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Konfirmasi Bayar</span>
            </button>

            <button
              onClick={() => handleSelectMenu('keuangan')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'keuangan' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Keuangan & Kas</span>
            </button>

            <button
              onClick={() => handleSelectMenu('produk')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'produk' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produk</span>
            </button>

            <button
              onClick={() => handleSelectMenu('testimoni')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'testimoni' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Testimoni</span>
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-neutral-100 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            <span>Lihat Toko</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-neutral-800 border border-neutral-200 hover:bg-neutral-50 shrink-0"
              aria-label="Buka Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
              {activeMenu === 'dashboard' && 'Ringkasan Statistik Toko'}
              {activeMenu === 'pesanan' && 'Kelola Daftar Pesanan'}
              {activeMenu === 'pembayaran' && 'Verifikasi Bukti Transfer'}
              {activeMenu === 'keuangan' && 'Buku Kas & Laporan Keuangan'}
              {activeMenu === 'produk' && 'Kelola Katalog Produk'}
              {activeMenu === 'testimoni' && 'Kelola Galeri Foto Testimoni'}
            </h1>
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase shrink-0">
            <span className="hidden xs:inline">Status: </span>
            <span className="text-emerald-600 font-bold">● Online</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeMenu === 'dashboard' && <DashboardComponent onNavigate={(menu) => setActiveMenu(menu)} />}
          {activeMenu === 'pesanan' && <PesananComponent />}
          {activeMenu === 'pembayaran' && <VerifikasiBayarComponent />}
          {activeMenu === 'keuangan' && <KeuanganComponent />}
          {activeMenu === 'produk' && <ProdukComponent />}
          {activeMenu === 'testimoni' && <TestimoniComponent />}
        </main>
      </div>

      {/* MODAL POPUP KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutModal(false)}
          />
          
          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-2.5 mx-auto">
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Almaco Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left leading-tight">
                <div className="text-base uppercase tracking-tight text-neutral-950">
                  <span className="font-black">ALMACO</span>
                  <span className="font-light text-neutral-500">FASHION</span>
                </div>
                <span className="text-[8px] text-neutral-400 font-medium tracking-wide block">
                  Fashionable • Syari • Berkualitas
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mt-1">
              <LogOut className="w-5 h-5 ml-0.5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Apakah Anda yakin ingin keluar dari sesi Panel Admin ALMACO FASHION?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-bold uppercase tracking-wider transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
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