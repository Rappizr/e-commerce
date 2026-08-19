'use client';

import React, { useState } from 'react';
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
  Wallet
} from 'lucide-react';

import DashboardComponent from './component/dashboard';
import PesananComponent from './component/pesanan';
import ProdukComponent from './component/produk';
import TestimoniComponent from './component/testimoni';
import VerifikasiBayarComponent from './component/verifikasi-bayar';
import KeuanganComponent from './component/keuangan';

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan'>('dashboard');

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex text-neutral-900 font-sans">
      
      {/* Sidebar Navigasi Kiri */}
      <aside className="w-60 bg-white border-r border-neutral-200 min-h-screen flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-neutral-100 flex items-center gap-2.5">
            <div className="relative w-9 h-9 shrink-0">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-black tracking-widest uppercase text-neutral-950 block">ALMACO</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase">PANEL ADMIN</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'dashboard' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu('pesanan')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'pesanan' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesanan</span>
            </button>

            <button
              onClick={() => setActiveMenu('pembayaran')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'pembayaran' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Konfirmasi Bayar</span>
            </button>

            <button
              onClick={() => setActiveMenu('keuangan')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'keuangan' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Keuangan & Kas</span>
            </button>

            <button
              onClick={() => setActiveMenu('produk')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                activeMenu === 'produk' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produk</span>
            </button>

            <button
              onClick={() => setActiveMenu('testimoni')}
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
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between">
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            {activeMenu === 'dashboard' && 'Ringkasan Statistik Toko'}
            {activeMenu === 'pesanan' && 'Kelola Daftar Pesanan'}
            {activeMenu === 'pembayaran' && 'Verifikasi Bukti Transfer'}
            {activeMenu === 'keuangan' && 'Buku Kas & Laporan Keuangan'}
            {activeMenu === 'produk' && 'Kelola Katalog Produk'}
            {activeMenu === 'testimoni' && 'Kelola Galeri Foto Testimoni'}
          </h1>
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">
            Status: <span className="text-emerald-600 font-bold">● Online</span>
          </div>
        </header>

        <main className="p-6 sm:p-8">
          {activeMenu === 'dashboard' && <DashboardComponent onNavigate={(menu) => setActiveMenu(menu)} />}
          {activeMenu === 'pesanan' && <PesananComponent />}
          {activeMenu === 'pembayaran' && <VerifikasiBayarComponent />}
          {activeMenu === 'keuangan' && <KeuanganComponent />}
          {activeMenu === 'produk' && <ProdukComponent />}
          {activeMenu === 'testimoni' && <TestimoniComponent />}
        </main>
      </div>

    </div>
  );
}