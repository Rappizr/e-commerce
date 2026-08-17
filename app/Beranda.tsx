'use client';

import Navbar from './Navbar';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Beranda() {
  const brandTicker = Array(12).fill('ALMACO FASHION');
  const deliveryTicker = Array(12).fill('TESTIMONI');

  const collections = [
    {
      title: 'Mantel Wol Elegan',
      price: 'Rp 1.899.000',
      tag: 'Pakaian Luar',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Rajut Oversized Nyaman',
      price: 'Rp 849.000',
      tag: 'Rajutan',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Celana Panjang Minimalis',
      price: 'Rp 699.000',
      tag: 'Bawahan',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const testimonialImages = [
    {
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 1',
    },
    {
      image: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 2',
    },
    {
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 3',
    },
    {
      image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 4',
    },
    {
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 5',
    },
    {
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop',
      alt: 'Bukti Testimoni Pengiriman 6',
    },
  ];

  return (
    <main id="beranda" className="min-h-screen bg-[#E6E3DA] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white scroll-smooth">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
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
          animation: marquee 28s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>

      <Navbar />

      <section className="relative h-[85vh] w-full flex items-center justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
          alt="Koleksi Musim Gugur Musim Dingin Almaco"
          fill
          priority
          className="object-cover object-center brightness-75"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-4 text-neutral-200">
            Musim Gugur / Musim Dingin
          </p>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-serif tracking-tight leading-none uppercase">
            KOLEKSI <br />
            <span className="font-light italic">2026</span>
          </h1>
        </div>
      </section>

      <div className="w-full bg-neutral-100/80 border-y border-neutral-200/70 py-4 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-sm md:text-base font-bold tracking-[0.45em] uppercase text-neutral-400/90 mx-8 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">KATALOG PILIHAN</p>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight">KOLEKSI TERBARU</h2>
          </div>
          <Link
            href="/product-detail"
            className="text-xs font-semibold uppercase tracking-widest underline underline-offset-8 hover:text-neutral-500 transition-colors duration-300"
          >
            LIHAT SEMUA
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {collections.map((item, idx) => (
            <Link
              key={idx}
              href="/product-detail"
              className="group cursor-pointer block"
            >
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest bg-white/90 backdrop-blur-sm px-2.5 py-1 text-neutral-800">
                  {item.tag}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm pt-1">
                <h3 className="font-medium uppercase tracking-wider text-neutral-900 group-hover:underline underline-offset-4">
                  {item.title}
                </h3>
                <span className="text-neutral-500 tracking-tight">{item.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="w-full bg-neutral-900 text-white py-4 overflow-hidden border-y border-neutral-800">
        <div className="animate-marquee flex items-center">
          {deliveryTicker.concat(deliveryTicker).map((item, idx) => (
            <span
              key={idx}
              className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>

      <section id="testimoni" className="bg-[#DFDBCF]/60 py-24 border-b border-neutral-300/70 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-14">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">BUKTI PENGIRIMAN ASLI</p>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight">TESTIMONI</h2>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <div className="animate-marquee-slow flex items-center">
            {testimonialImages.concat(testimonialImages).map((item, idx) => (
              <div
                key={idx}
                className="w-[280px] sm:w-[320px] md:w-[360px] aspect-[4/5] relative bg-neutral-200 mx-3.5 shrink-0 overflow-hidden border border-neutral-200 shadow-sm group cursor-pointer"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#E6E3DA] border-t border-neutral-300/70 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
            <div className="md:col-span-6 space-y-4">
              <h3 className="text-3xl font-black tracking-tight uppercase text-neutral-950">
                ALMACO FASHION
              </h3>
              <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
                Sentuhan rancangan arsitektural untuk kepribadian modern. Didesain dengan presisi dan diproduksi tanpa kompromi.
              </p>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                BELANJA
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-neutral-700">
                <li><Link href="#beranda" className="hover:text-neutral-950 transition-colors duration-200">Pria</Link></li>
                <li><Link href="#beranda" className="hover:text-neutral-950 transition-colors duration-200">Wanita</Link></li>
                <li><Link href="#beranda" className="hover:text-neutral-950 transition-colors duration-200">Aksesori</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                TENTANG KAMI
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-neutral-700">
                <li><Link href="/tentang-kami" className="hover:text-neutral-950 transition-colors duration-200">Tentang Kami</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] tracking-wider uppercase text-neutral-400">
            <p>© 2026 ALMACO. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</p>
            <div className="flex space-x-6">
              <Link href="#" className="hover:text-neutral-700 transition-colors duration-200">KEBIJAKAN PRIVASI</Link>
              <Link href="#" className="hover:text-neutral-700 transition-colors duration-200">SYARAT & KETENTUAN</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}