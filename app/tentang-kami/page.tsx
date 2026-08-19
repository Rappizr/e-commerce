'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';
import Footer from '../Footer';

export default function TentangKami() {
  const brandTicker = Array(12).fill('ALMACO FASHION');

  const values = [
    {
      icon: Sparkles,
      title: 'Desain Modest Elegan',
      desc: 'Setiap potongan pola dipikirkan secara matang untuk menghasilkan siluet busana yang anggun, syari, dan nyaman.',
    },
    {
      icon: ShieldCheck,
      title: 'Kualitas Tanpa Kompromi',
      desc: 'Pemilihan material premium mulai dari rayon adem, knit crinkle, hingga abaya silk eksklusif yang tahan lama.',
    },
    {
      icon: Leaf,
      title: 'Mode Berkelanjutan',
      desc: 'Meminimalisir limbah kain produksi melalui konsep timeless fashion yang tidak lekang oleh tren musiman sesaat.',
    },
    {
      icon: HeartHandshake,
      title: 'Sentuhan Pengrajin Lokal',
      desc: 'Diproduksi langsung oleh tangan-tangan penjahit terampil di Tulungagung dengan standar jahitan butik berkualitas tinggi.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      <style jsx global>{`
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
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header Full-Width Rata Tepi seperti Beranda */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Rata Kiri */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0">
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
            <span>Kembali</span>
          </Link>

        </div>
      </header>

      {/* Header Section */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-3 font-semibold">
            TENTANG ALMACO FASHION
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif uppercase tracking-tight leading-tight mb-6 text-neutral-950">
            MERANCANG KEANGGUNAN MODERN MELALUI KESEDERHANAAN.
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            Berdiri sejak 2024, <strong>ALMACO FASHION</strong> lahir dari keinginan untuk menghadirkan busana harian bernilai seni tinggi. Kami memadukan estetika modest modern dengan kenyamanan material alami untuk menciptakan pakaian harian yang fashionable, syari, dan tahan lama.
          </p>
        </div>
      </section>

      {/* Visual Storytelling Section */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] bg-neutral-200 overflow-hidden shadow-xs border border-neutral-200">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
              alt="Proses Desain Almaco"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
                FILOSOFI KAMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-neutral-900">
                LEBIH DARI SEKADAR PAKAIAN
              </h2>
            </div>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Bagi kami, berpakaian adalah bentuk ekspresi diri yang santun dan anggun. Kami fokus menciptakan busana harian seperti daster arab renda, setelan kulot nyaman, dan abaya eksklusif yang fleksibel untuk berbagai suasana—dari waktu santai di rumah hingga silaturahmi formal.
            </p>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Setiap helai kain diuji ketahanan dan teksturnya agar memberikan kenyamanan maksimal bagi iklim tropis Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full bg-neutral-900 text-white py-3.5 overflow-hidden border-y border-neutral-800">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              ✦ {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Nilai / Keunggulan Kami */}
      <section className="bg-[#EFECE6] py-20 border-b border-neutral-200">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-semibold">
              PRINSIP UTAMA
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-neutral-900">
              NILAI YANG KAMI PEGANG
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 border border-neutral-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-neutral-900">
                      {val.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Global */}
      <Footer />
    </main>
  );
}