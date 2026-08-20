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
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none truncate">
              <div className="text-lg sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1 truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Lanjut Belanja</span>
            <span className="xs:hidden">Belanja</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-14">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 p-8 sm:p-12 text-center space-y-4 my-6 sm:my-8 shadow-xs">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto" />
            <p className="text-xs sm:text-sm text-neutral-500 font-medium uppercase tracking-wider">
              Keranjang belanja Anda masih kosong
            </p>
            <Link
              href="/"
              className="inline-block bg-neutral-900 text-white text-[11px] sm:text-xs uppercase tracking-widest font-bold py-3 sm:py-3.5 px-6 sm:px-8 transition hover:bg-black shadow-xs"
            >
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white border border-neutral-200/80 p-3.5 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="relative w-18 h-22 sm:w-20 sm:h-24 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">
                        Ukuran: {item.size} | Warna: {item.color}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 pt-0.5">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                    <div className="flex items-center border border-neutral-200 bg-neutral-50">
                      <button
                        onClick={() => updateQty(item.id, item.size, item.color, -1)}
                        className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition"
                      >
                        -
                      </button>
                      <span className="px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-neutral-800">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.size, item.color, 1)}
                        className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-neutral-900 min-w-20 sm:min-w-24 text-right">
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

            <div className="lg:col-span-4 bg-white border border-neutral-200/80 p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-xs sticky top-24">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3 sm:pb-4">
                Ringkasan Belanja
              </h2>
              <div className="space-y-2.5 sm:space-y-3 text-[11px] sm:text-xs uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Ongkir</span>
                  <span className="text-neutral-400 text-[10px] sm:text-xs">Dihitung saat checkout</span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-xs sm:text-sm font-bold text-neutral-900">
                  <span>Total</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full bg-neutral-900 hover:bg-black text-white text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] font-semibold uppercase py-3.5 sm:py-4 flex items-center justify-center space-x-2 transition duration-300 shadow-md"
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