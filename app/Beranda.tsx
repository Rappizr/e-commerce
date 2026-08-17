'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ShoppingBag } from 'lucide-react';

export default function Beranda() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const brandTicker = Array(12).fill('ALMACO FASHION');
  const deliveryTicker = Array(12).fill('TESTIMONI PENGIRIMAN');

  const categories = ['Semua', 'Daster', 'Gamis', 'Setcel', 'Best Seller'];

  const products = [
    {
      id: 1,
      title: 'Daster Arab Renda Rayon Premium',
      category: 'Daster',
      price: 'Rp 115.000',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      badge: 'Best Seller',
    },
    {
      id: 2,
      title: 'Daster Midi Floral Rayon Adem',
      category: 'Daster',
      price: 'Rp 89.000',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
      badge: 'Favorit',
    },
    {
      id: 3,
      title: 'Daster Kaftan Siluet Minimalis',
      category: 'Daster',
      price: 'Rp 135.000',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      badge: 'Terbaru',
    },
    {
      id: 4,
      title: 'Gamis Abaya Silk Polos Elegan',
      category: 'Gamis',
      price: 'Rp 275.000',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      badge: 'Eksklusif',
    },
    {
      id: 5,
      title: 'Daster Panjang Twill Busui Friendly',
      category: 'Daster',
      price: 'Rp 105.000',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      badge: 'Promo',
    },
    {
      id: 6,
      title: 'Setcel Knit Crinkle Kulot',
      category: 'Setcel',
      price: 'Rp 189.000',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
      badge: 'Hot Item',
    },
    {
      id: 7,
      title: 'Gamis Tiered Dress Pastel Mewah',
      category: 'Gamis',
      price: 'Rp 299.000',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      badge: 'Premium',
    },
    {
      id: 8,
      title: 'Setcel Rayon Motif Tie Dye Harian',
      category: 'Setcel',
      price: 'Rp 165.000',
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
      badge: 'Best Seller',
    },
  ];

  const testimonialImages = [
    { image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', alt: 'Paket 1' },
    { image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop', alt: 'Paket 2' },
    { image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop', alt: 'Paket 3' },
    { image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', alt: 'Paket 4' },
    { image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop', alt: 'Paket 5' },
  ];

  return (
    <main id="beranda" className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white scroll-smooth">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 26s linear infinite;
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

      <section className="relative h-[40vh] w-full flex items-center justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
          alt="Almaco Autumn Winter Collection"
          fill
          priority
          className="object-cover object-center brightness-75"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        
        <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-2 text-neutral-200">
            Musim Gugur / Musim Dingin
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-none uppercase">
            KOLEKSI <span className="font-light italic text-neutral-300">2026</span>
          </h1>
        </div>
      </section>

      <div className="w-full bg-neutral-100/90 border-y border-neutral-200 py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-wider px-4 py-2 transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-neutral-400">Urutkan:</span>
            <div className="relative">
              <select className="text-xs font-medium bg-white border border-neutral-200 py-2 pl-3 pr-8 appearance-none focus:outline-none focus:border-neutral-900 cursor-pointer">
                <option>Paling Sesuai</option>
                <option>Harga: Rendah ke Tinggi</option>
                <option>Harga: Tinggi ke Rendah</option>
                <option>Produk Terbaru</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <Link
              key={item.id}
              href={`/product-detail?id=${item.id}`}
              className="group bg-white border border-neutral-200/80 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >

              <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-bold tracking-wider bg-white/95 px-2 py-0.5 border border-neutral-200 text-neutral-900">
                  {item.badge}
                </span>

                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-neutral-900/95 backdrop-blur-sm text-white text-[11px] font-semibold py-2.5 uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-950">
                    <ShoppingBag className="w-3.5 h-3.5" /> Lihat Detail
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{item.category}</span>
                <h4 className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:underline underline-offset-2">
                  {item.title}
                </h4>
                <p className="text-sm font-bold text-neutral-900 tracking-tight">
                  {item.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section> 

      <div className="w-full bg-neutral-900 text-white py-3.5 overflow-hidden border-y border-neutral-800">
        <div className="animate-marquee flex items-center">
          {deliveryTicker.concat(deliveryTicker).map((item, idx) => (
            <span
              key={idx}
              className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>

      <section id="testimoni" className="bg-[#EFECE6] py-16 border-b border-neutral-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-semibold">BUKTI PENGIRIMAN ASLI</p>
          <h2 className="text-3xl font-serif uppercase tracking-tight">TESTIMONI</h2>
        </div>

        <div className="w-full overflow-hidden">
          <div className="animate-marquee-slow flex items-center">
            {testimonialImages.concat(testimonialImages).map((item, idx) => (
              <div
                key={idx}
                className="w-[240px] sm:w-[280px] aspect-[4/5] relative bg-neutral-200 mx-3 shrink-0 overflow-hidden border border-neutral-200 shadow-sm"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}