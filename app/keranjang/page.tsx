'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';

export default function KeranjangPage() {
  const { cartItems, updateQty, removeItem, subtotal } = useKeranjang();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between">
      
      {/* Header Full-Width Rata Tepi seperti Beranda */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Rata Kiri */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-xl sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide block mt-1">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          {/* Tombol Kembali Rata Kanan */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lanjut Belanja</span>
          </Link>

        </div>
      </header>

      {/* Konten Keranjang Belanja */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tight mb-8 text-neutral-900">
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 p-12 text-center space-y-4 my-8 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">
              Keranjang belanja Anda masih kosong
            </p>
            <Link
              href="/"
              className="inline-block bg-neutral-900 text-white text-xs uppercase tracking-widest font-bold py-3.5 px-8 transition hover:bg-black"
            >
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Kolom Daftar Barang */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white border border-neutral-200/80 p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-400 uppercase tracking-widest">
                        Ukuran: {item.size} | Warna: {item.color}
                      </p>
                      <p className="text-sm font-medium text-neutral-800 pt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                    <div className="flex items-center border border-neutral-200 bg-neutral-50">
                      <button
                        onClick={() => updateQty(item.id, item.size, item.color, -1)}
                        className="px-3 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold text-neutral-800">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.size, item.color, 1)}
                        className="px-3 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-bold text-neutral-900 min-w-24 text-right">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>

                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="text-neutral-400 hover:text-red-600 transition p-1"
                      aria-label="Hapus Barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Kolom Ringkasan Belanja */}
            <div className="lg:col-span-4 bg-white border border-neutral-200/80 p-6 space-y-6 shadow-xs sticky top-28">
              <h2 className="text-base font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-4">
                Ringkasan Belanja
              </h2>
              <div className="space-y-3 text-xs uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Ongkir</span>
                  <span className="text-neutral-400">Dihitung saat checkout</span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Total</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full bg-neutral-900 hover:bg-black text-white text-xs tracking-[0.2em] font-semibold uppercase py-4 flex items-center justify-center space-x-2 transition duration-300 transform hover:scale-[1.02] shadow-md"
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