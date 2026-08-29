'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, ArrowRight, Minus, Plus, Scale } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';

export default function KeranjangPage() {
  const { 
    cartItems = [], 
    updateQty, 
    removeItem, 
    hapusItem, 
    subtotal = 0 
  } = (useKeranjang() as any) || {};

  // Kompatibilitas fungsi hapus item
  const handleDelete = (id: string | number, size?: string, color?: string) => {
    if (typeof hapusItem === 'function') {
      hapusItem(id, size, color);
    } else if (typeof removeItem === 'function') {
      removeItem(id, size, color);
    }
  };

  // Kompatibilitas fungsi update kuantitas
  const handleUpdateQty = (id: string | number, size: string, color: string, currentQty: number, change: number) => {
    const targetQty = currentQty + change;
    if (targetQty <= 0) {
      handleDelete(id, size, color);
      return;
    }
    if (typeof updateQty === 'function') {
      updateQty(id, size, color, targetQty);
    }
  };

  // Hitung total berat dalam gram
  const totalWeight = cartItems.reduce(
    (acc: number, item: any) => acc + (Number(item.weight) || 350) * item.qty, 
    0
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0">
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
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Lanjut Belanja</span>
            <span className="xs:hidden">Belanja</span>
          </Link>
        </div>
      </header>

      {/* DAFTAR ITEM KERANJANG */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-8 sm:p-14 text-center space-y-4 my-6 shadow-xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-300">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                Keranjang Belanja Anda Kosong
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
                Temukan berbagai koleksi daster, gamis, dan busana muslimah elegan kami.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-neutral-950 text-white text-[11px] sm:text-xs uppercase tracking-widest font-bold py-3 px-6 sm:px-8 transition hover:bg-black shadow-xs mt-2"
            >
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* KOLOM KIRI: DAFTAR PRODUK */}
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              {cartItems.map((item: any) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white border border-neutral-200 p-3.5 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                      <Image 
                        src={item.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop'} 
                        alt={item.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">
                        Ukuran: <strong className="text-neutral-800">{item.size || 'All Size'}</strong> | Warna: <strong className="text-neutral-800">{item.color || 'Default'}</strong>
                      </p>
                      <p className="text-xs font-bold text-neutral-950 pt-0.5">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                    {/* KONTROL KUANTITAS */}
                    <div className="flex items-center border border-neutral-300 rounded bg-white">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.size, item.color, item.qty, -1)}
                        className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-neutral-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-neutral-800">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.size, item.color, item.qty, 1)}
                        className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-neutral-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-neutral-950 min-w-20 text-right">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.size, item.color)}
                      className="text-neutral-400 hover:text-rose-600 transition p-1"
                      aria-label="Hapus Barang"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* KOLOM KANAN: RINGKASAN BELANJA */}
            <div className="lg:col-span-4 bg-white border border-neutral-200 p-5 sm:p-6 space-y-5 shadow-xs sticky top-24">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3 sm:pb-4">
                RINGKASAN BELANJA
              </h2>
              
              <div className="space-y-2.5 text-xs uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-neutral-900">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Total Berat</span>
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {totalWeight} Gram
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Biaya Ongkir</span>
                  <span>Dihitung di Checkout</span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Total Sementara</span>
                  <span className="text-base font-bold text-neutral-950">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs tracking-[0.2em] font-bold uppercase py-3.5 sm:py-4 flex items-center justify-center gap-2 transition shadow-md text-center"
              >
                <span>Lanjut Ke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}