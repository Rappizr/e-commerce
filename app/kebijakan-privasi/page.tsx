'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../Footer';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Bell } from 'lucide-react';

export default function KebijakanPrivasi() {
  const sections = [
    {
      icon: Eye,
      title: '1. Informasi yang Kami Kumpulkan',
      desc: 'Kami mengumpulkan informasi penting untuk keperluan pemrosesan pesanan, seperti nama lengkap, alamat pengiriman, nomor telepon/WhatsApp, alamat email, serta data transaksi pembayaran saat Anda melakukan pembelian produk.',
    },
    {
      icon: Lock,
      title: '2. Penggunaan Data Pribadi',
      desc: 'Informasi Anda hanya digunakan untuk:',
      bullets: [
        'Memproses, mengemas, dan mengirimkan pesanan ke alamat tujuan.',
        'Mengirimkan konfirmasi pesanan, nomor resi kurir, dan bukti transaksi.',
        'Memberikan layanan pelanggan jika terdapat kendala ukuran atau pertukaran produk.',
        'Menginformasikan katalog koleksi terbaru dan penawaran khusus (jika disetujui).',
      ],
    },
    {
      icon: ShieldCheck,
      title: '3. Keamanan Data',
      desc: 'ALMACO FASHION berkomitmen penuh menjaga kerahasiaan data Anda. Kami tidak akan pernah menjual, menyewakan, atau menyebarluaskan informasi pribadi Anda kepada pihak ketiga di luar keperluan pengiriman ekspedisi dan gerbang pembayaran resmi.',
    },
    {
      icon: FileText,
      title: '4. Cookie dan Analitik',
      desc: 'Website kami menggunakan cookie standar untuk mengingat preferensi keranjang belanja Anda dan mengoptimalkan performa halaman agar pengalaman berbelanja menjadi lebih cepat dan nyaman.',
    },
    {
      icon: Bell,
      title: '5. Hubungi Kami',
      desc: 'Jika Anda memiliki pertanyaan mengenai kebijakan privasi atau ingin memperbarui/menghapus data pribadi Anda dari sistem kami, silakan hubungi tim layanan pelanggan ALMACO FASHION melalui kontak resmi yang tersedia.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white flex flex-col justify-between overflow-x-hidden">
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
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="border-b border-neutral-200 pb-6 sm:pb-8 mb-8 sm:mb-10 text-center sm:text-left">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-neutral-400 mb-2 font-bold">
            LEGAL & KEAMANAN
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif uppercase tracking-tight text-neutral-950 mb-2.5 sm:mb-3">
            KEBIJAKAN PRIVASI
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 uppercase tracking-wider">
            Terakhir Diperbarui: Agustus 2026
          </p>
        </div>

        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
          Selamat datang di <strong>ALMACO FASHION</strong>. Kami menghargai privasi dan kepercayaan Anda saat berbelanja di platform kami. Halaman ini menjelaskan bagaimana data dan informasi pribadi Anda dikumpulkan, digunakan, serta dilindungi secara bertanggung jawab.
        </p>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-2.5 sm:space-y-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h2 className="text-xs sm:text-base font-bold uppercase tracking-wider text-neutral-900 leading-snug">
                    {sec.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-0.5 sm:pt-1">
                  {sec.desc}
                </p>

                {sec.bullets && (
                  <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-neutral-600 pl-1 sm:pl-2 pt-0.5 sm:pt-1">
                    {sec.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}