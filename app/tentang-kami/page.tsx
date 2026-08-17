'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

export default function TentangKami() {
  const brandTicker = Array(12).fill('ALMACO FASHION');

  const values = [
    {
      icon: Sparkles,
      title: 'Desain Arsitektural',
      desc: 'Setiap potongan pola dipikirkan secara matang untuk menghasilkan siluet busana yang tegas, presisi, dan proporsional.',
    },
    {
      icon: ShieldCheck,
      title: 'Kualitas Tanpa Kompromi',
      desc: 'Pemilihan material premium mulai dari serat wol alami hingga rajutan berkualitas tinggi yang awet dipakai bertahun-tahun.',
    },
    {
      icon: Leaf,
      title: 'Mode Berkelanjutan',
      desc: 'Meminimalisir limbah kain produksi melalui konsep timeless fashion yang tidak lekang oleh tren musiman sesaat.',
    },
    {
      icon: HeartHandshake,
      title: 'Sentuhan Pengrajin Lokal',
      desc: 'Dikerjakan langsung oleh tangan-tangan penjahit ahli dengan standar jahitan butik berskala internasional.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#E6E3DA] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
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

      {/* Navbar Khusus: Hanya Logo + Nama Brand dan Tombol Kembali */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-neutral-200 shadow-sm">
              <Image
                src="/LOGO.jpeg"
                alt="Almaco Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest text-neutral-900 uppercase">
              ALMACO FASHION
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors border border-neutral-300 px-4 py-2 hover:border-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3 font-semibold">
            TENTANG ALMACO FASHION
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif uppercase tracking-tight leading-tight mb-8">
            MERANCANG KEANGGUNAN MODERN MELALUI KESEDERHANAAN.
          </h1>
          <p className="text-neutral-700 text-base sm:text-lg leading-relaxed">
            Berdiri sejak 2024, <strong>ALMACO FASHION</strong> lahir dari keinginan untuk menghadirkan busana harian bernilai seni tinggi. Kami menggabungkan pendekatan struktural arsitektur modern dengan kenyamanan material alami untuk menciptakan pakaian esensial yang abadi.
          </p>
        </div>
      </section>

      {/* Visual Storytelling Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] bg-neutral-200 overflow-hidden shadow-sm">
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
              <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight">
                LEBIH DARI SEKADAR PAKAIAN
              </h2>
            </div>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Bagi kami, berpakaian adalah bentuk ekspresi diri yang tenang namun kuat. Kami tidak mengejar tren kilat (fast-fashion), melainkan fokus menciptakan siluet klasik yang fleksibel untuk berbagai suasana—dari ruang kerja profesional hingga momen santai akhir pekan.
            </p>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Setiap helai kain diuji ketahanan dan teksturnya agar memberikan kenyamanan maksimal bagi iklim tropis maupun suasana sejuk perkotaan.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full bg-neutral-900 text-white py-4 overflow-hidden border-y border-neutral-800">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-xs md:text-sm font-bold tracking-[0.45em] uppercase text-neutral-400 mx-8 select-none"
            >
              ✦ {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Nilai / Keunggulan Kami */}
      <section className="bg-[#DFDBCF]/60 py-24 border-b border-neutral-300/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2 font-semibold">
              PRINSIP UTAMA
            </p>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight">
              NILAI YANG KAMI PEGANG
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#E6E3DA] p-8 border border-neutral-300/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center mb-6">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-wider mb-3">
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

      {/* Footer */}
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
                <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Pria</Link></li>
                <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Wanita</Link></li>
                <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Aksesori</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                TENTANG KAMI
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-neutral-700">
                <li><Link href="/tentang-kami" className="hover:text-neutral-950 transition-colors duration-200 font-bold">Tentang Kami</Link></li>
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