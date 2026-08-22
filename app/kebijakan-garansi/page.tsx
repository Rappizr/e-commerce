'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ShieldCheck, 
  RotateCcw, 
  Clock, 
  FileCheck2, 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Footer from '../Footer';

export default function KebijakanGaransiPage() {
  const waContactUrl = `https://api.whatsapp.com/send?phone=6285138472520&text=${encodeURIComponent(
    'Halo Admin ALMACO FASHION, saya ingin mengajukan klaim garansi/retur produk.'
  )}`;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-8 h-8 sm:w-12 sm:h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none truncate">
              <div className="text-base sm:text-2xl uppercase tracking-tight text-neutral-950 truncate">
                <span className="font-black">ALMACO</span>
                <span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1 truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-2.5 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Kembali Ke Beranda</span>
            <span className="xs:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-10 border-b border-neutral-200/80 pb-5 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-neutral-950 text-white text-[9px] sm:text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>Garansi Pelanggan 100%</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight text-neutral-950">
            Kebijakan Garansi & Retur
          </h1>
          <p className="text-[11px] sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Komitmen kami untuk memberikan busana muslimah dan daster premium terbaik dengan jaminan penggantian penuh jika pesanan tidak sesuai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 shadow-xs text-center space-y-1.5 sm:space-y-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-neutral-900" />
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950">Batas Waktu 2x24 Jam</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed">
              Pengajuan klaim retur dapat dilakukan maksimal 2 hari sejak paket diterima.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 shadow-xs text-center space-y-1.5 sm:space-y-2">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-neutral-900" />
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950">Ganti Baru Bebas Ongkir</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed">
              Ongkos kirim kami tanggung 100% jika kesalahan dari pihak kami atau produk cacat.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 shadow-xs text-center space-y-1.5 sm:space-y-2">
            <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-neutral-900" />
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950">Proses Cepat & Mudah</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed">
              Klaim langsung diproses melalui WhatsApp CS resmi kami tanpa prosedur yang rumit.
            </p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 p-4 sm:p-8 space-y-5 sm:space-y-6 text-xs text-neutral-700 leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900 shrink-0" />
              <span>1. Syarat dan Ketentuan Pengajuan Retur</span>
            </h2>
            <ul className="space-y-1.5 pl-5 sm:pl-6 list-disc text-neutral-600 text-[11px] sm:text-xs">
              <li>Produk yang diterima mengalami cacat produksi (robek, noda permanen, resleting rusak, atau jahitan lepas).</li>
              <li>Produk yang dikirimkan tidak sesuai dengan rincian pesanan (salah warna, salah model, atau salah ukuran).</li>
              <li>Label tag merek ALMACO masih terpasang utuh dan pakaian belum pernah dicuci atau digunakan beraktivitas.</li>
              <li>Menyertakan <strong>video unboxing</strong> saat membuka paket dari kondisi tersegel pertama kali.</li>
            </ul>
          </section>

          <hr className="border-neutral-100" />

          <section className="space-y-2">
            <h2 className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
              <span>2. Kondisi yang Tidak Masuk Garansi</span>
            </h2>
            <ul className="space-y-1.5 pl-5 sm:pl-6 list-disc text-neutral-600 text-[11px] sm:text-xs">
              <li>Kerusakan yang timbul akibat kelalaian pembeli saat membuka paket dengan benda tajam.</li>
              <li>Perbedaan toleransi ukuran 1–2 cm yang wajar akibat proses pemotongan dan penjahitan konveksi.</li>
              <li>Sedikit perbedaan tone warna pakaian akibat pencahayaan foto katalog atau resolusi layar monitor HP.</li>
              <li>Pengajuan klaim yang melewati batas waktu 2x24 jam setelah kurir menyelesaikan pengiriman paket.</li>
            </ul>
          </section>

          <hr className="border-neutral-100" />

          <section className="space-y-2">
            <h2 className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900 shrink-0" />
              <span>3. Langkah-langkah Pengajuan Klaim</span>
            </h2>
            <ol className="space-y-1.5 pl-5 sm:pl-6 list-decimal text-neutral-600 text-[11px] sm:text-xs">
              <li>Hubungi Customer Service ALMACO melalui kontak WhatsApp resmi di bawah.</li>
              <li>Kirimkan <strong>Nomor Invoice Pesanan</strong> serta foto/video detail bagian yang cacat atau keliru.</li>
              <li>Tim kami akan melakukan verifikasi data maksimal dalam waktu 1x24 jam kerja.</li>
              <li>Kirimkan kembali pakaian ke alamat gudang kami di Tulungagung. Setelah resi diterima, produk pengganti akan segera dikirimkan ke alamat Anda.</li>
            </ol>
          </section>

          <div className="pt-3 sm:pt-4 border-t border-neutral-100">
            <div className="bg-[#F4F3EE] p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
              <div className="space-y-0.5">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Butuh Bantuan Klaim Pesanan?
                </h4>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">
                  Hubungi admin layanan pelanggan kami setiap hari Senin–Sabtu (08.00–21.00 WIB).
                </p>
              </div>

              <a
                href={waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}