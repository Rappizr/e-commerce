'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
import Footer from '../../Footer';

export default function PembayaranComponent({ totalAmount = 299000 }: { totalAmount?: number }) {
  const [copiedRek, setCopiedRek] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  const orderData = {
    invoiceId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    totalTagihan: totalAmount,
    bank: 'BANK BCA',
    noRek: '0481980827',
    atasNama: 'TITIN PRAMUDYA WATI',
  };

  const handleCopyRek = () => {
    navigator.clipboard.writeText(orderData.noRek.replace(/\s+/g, ''));
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 2000);
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(orderData.totalTagihan.toString());
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
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
                <span className="font-black">ALMACO</span>
                <span className="font-light text-neutral-600">FASHION</span>
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
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Kembali Beranda</span>
            <span className="xs:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.25em] sm:tracking-[0.3em] text-neutral-400 block">
            PESANAN BERHASIL DIBUAT
          </span>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight text-neutral-950 leading-snug">
            TERIMA KASIH TELAH BERBELANJA!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Pesanan Anda dengan nomor tagihan <strong className="text-neutral-950 font-mono">{orderData.invoiceId}</strong> telah kami terima. Silakan lakukan pembayaran ke rekening resmi di bawah ini agar pesanan dapat segera kami kemas dan kirimkan.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50/70 border border-amber-200 p-3 sm:p-3.5 text-amber-900 text-[11px] sm:text-xs gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Selesaikan transfer dalam waktu <strong>1 x 24 Jam</strong></span>
            </div>
            <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-800 self-start sm:self-auto">
              Menunggu Transfer
            </span>
          </div>

          <div className="border border-neutral-200 bg-neutral-50/60 p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                Total Yang Harus Ditransfer
              </span>
              <p className="text-xl sm:text-3xl font-bold text-neutral-950 tracking-tight mt-0.5">
                Rp {orderData.totalTagihan.toLocaleString('id-ID')}
              </p>
            </div>
            <button
              onClick={handleCopyNominal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 text-[11px] sm:text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:border-neutral-900 transition-colors shadow-xs w-full sm:w-auto justify-center"
            >
              {copiedNominal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNominal ? 'Tersalin' : 'Salin Nominal'}</span>
            </button>
          </div>

          <div className="border border-neutral-200 p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-6 sm:w-14 sm:h-7 shrink-0 border border-neutral-200 px-1 flex items-center justify-center bg-white">
                <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain p-0.5" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{orderData.bank}</p>
                <p className="text-xs font-bold text-neutral-900">{orderData.atasNama}</p>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 sm:p-3.5 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Nomor Rekening / Virtual Account
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-neutral-900 tracking-wider block mt-0.5">
                  {orderData.noRek}
                </span>
              </div>
              <button
                onClick={handleCopyRek}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 text-[11px] sm:text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:border-neutral-900 transition-colors shadow-xs w-full sm:w-auto justify-center"
                title="Salin Nomor Rekening"
              >
                {copiedRek ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRek ? 'Tersalin' : 'Salin No. Rekening'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2.5 sm:space-y-3">
            <p className="text-[11px] sm:text-xs text-neutral-500 text-center leading-relaxed">
              Sudah selesai transfer? Silakan lakukan konfirmasi pembayaran dan upload bukti transfer Anda di sini:
            </p>

            <Link
              href="/konfirmasi-pembayaran"
              className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] py-3.5 sm:py-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <span>Konfirmasi Pembayaran Di Sini</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider py-3 sm:py-3.5 transition-colors block text-center"
            >
              Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}