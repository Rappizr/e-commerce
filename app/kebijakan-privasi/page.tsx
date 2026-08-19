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
    <main className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      
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

      {/* Konten Utama Kebijakan Privasi */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="border-b border-neutral-200 pb-8 mb-10 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2 font-bold">
            LEGAL & KEAMANAN
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif uppercase tracking-tight text-neutral-950 mb-3">
            KEBIJAKAN PRIVASI
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Terakhir Diperbarui: Agustus 2026
          </p>
        </div>

        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-8">
          Selamat datang di <strong>ALMACO FASHION</strong>. Kami menghargai privasi dan kepercayaan Anda saat berbelanja di platform kami. Halaman ini menjelaskan bagaimana data dan informasi pribadi Anda dikumpulkan, digunakan, serta dilindungi secara bertanggung jawab.
        </p>

        <div className="space-y-6">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200 p-6 sm:p-7 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
                    {sec.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
                  {sec.desc}
                </p>

                {sec.bullets && (
                  <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-neutral-600 pl-2 pt-1">
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