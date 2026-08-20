'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../Footer';
import { ArrowLeft, FileCheck, ShoppingBag, CreditCard, Truck, RefreshCw, AlertCircle } from 'lucide-react';

export default function SyaratDanKetentuan() {
  const terms = [
    {
      icon: FileCheck,
      title: '1. Ketentuan Umum',
      desc: 'Dengan mengakses dan melakukan pemesanan di website ALMACO FASHION, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini.',
    },
    {
      icon: ShoppingBag,
      title: '2. Pemesanan & Ketersediaan Produk',
      desc: 'Seluruh pesanan diproses berdasarkan ketersediaan stok aktual. Kami berhak membatalkan atau menyesuaikan pesanan apabila terjadi kesalahan teknis pada sistem informasi harga atau stok produk.',
      bullets: [
        'Foto produk ditampilkan seakurat mungkin, namun sedikit perbedaan warna dapat terjadi akibat pencahayaan foto atau layar gawai Anda.',
        'Detail ukuran (size chart) tercantum pada masing-masing halaman produk dengan toleransi jahit 1-2 cm.',
      ],
    },
    {
      icon: CreditCard,
      title: '3. Harga & Pembayaran',
      desc: 'Harga yang tertera adalah dalam mata uang Rupiah (IDR) dan belum termasuk ongkos kirim ekspedisi.',
      bullets: [
        'Pembayaran dilakukan melalui transfer Bank BCA / Virtual Account resmi yang tertera di website.',
        'Batas waktu pembayaran pesanan adalah 1x24 jam sebelum sistem membatalkan pesanan secara otomatis.',
      ],
    },
    {
      icon: Truck,
      title: '4. Pengiriman',
      desc: 'Pengiriman pesanan dilakukan dari gudang operasional kami menggunakan jasa kurir terpercaya (JNE, SiCepat, J&T).',
      bullets: [
        'Pesanan diproses dan diserahkan ke ekspedisi maksimal 1-2 hari kerja setelah pembayaran terkonfirmasi.',
        'Nomor resi pengiriman akan diberikan segera setelah paket diproses oleh pihak kurir.',
        'Keterlambatan yang disebabkan oleh kendala operasional pihak ekspedisi berada di luar kendali langsung ALMACO FASHION, namun kami siap membantu pelacakan hingga paket sampai.',
      ],
    },
    {
      icon: RefreshCw,
      title: '5. Pengembalian & Penukaran (Retur)',
      desc: 'Kami menerima penukaran produk jika barang yang diterima cacat produksi atau terjadi kesalahan pengiriman dari pihak kami.',
      bullets: [
        'Klaim retur wajib menyertakan video unboxing utuh tanpa jeda/edit maksimal 2x24 jam sejak paket berstatus diterima.',
        'Produk yang diretur harus dalam kondisi baru, belum dicuci, tidak berbau parfum, dan tag label masih terpasang utuh.',
      ],
    },
    {
      icon: AlertCircle,
      title: '6. Hak Kekayaan Intelektual',
      desc: 'Seluruh konten, foto produk, logo, desain grafis, dan materi visual pada website ini merupakan hak milik ALMACO FASHION. Dilarang keras menyalin, menyalahgunakan, atau mendistribusikan tanpa izin tertulis dari kami.',
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
            LEGAL & PANDUAN BERBELANJA
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif uppercase tracking-tight text-neutral-950 mb-2.5 sm:mb-3">
            SYARAT & KETENTUAN
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 uppercase tracking-wider">
            Terakhir Diperbarui: Agustus 2026
          </p>
        </div>

        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
          Syarat & Ketentuan berikut mengatur penggunaan layanan transaksi jual beli di situs resmi <strong>ALMACO FASHION</strong>. Mohon luangkan waktu untuk membaca ketentuan ini demi kenyamanan dan keamanan transaksi Anda.
        </p>

        <div className="space-y-4 sm:space-y-6">
          {terms.map((sec, idx) => {
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