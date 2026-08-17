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
    <main className="min-h-screen bg-[#E6E3DA] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
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
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors border border-neutral-300 px-4 py-2 hover:border-neutral-900 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="border-b border-neutral-300/80 pb-8 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2 font-semibold">
            LEGAL & PANDUAN BERBELANJA
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif uppercase tracking-tight text-neutral-950 mb-4">
            SYARAT & KETENTUAN
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Terakhir Diperbarui: Agustus 2026
          </p>
        </div>
        <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-10">
          Syarat & Ketentuan berikut mengatur penggunaan layanan transaksi jual beli di situs resmi <strong>ALMACO FASHION</strong>. Mohon luangkan waktu untuk membaca ketentuan ini demi kenyamanan dan keamanan transaksi Anda.
        </p>

        <div className="space-y-8">
          {terms.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm border border-neutral-300/80 p-6 sm:p-8 rounded-[2px] shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-900">
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