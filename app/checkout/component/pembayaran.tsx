'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  Clock, 
  CreditCard,
  Building2,
  FileCheck
} from 'lucide-react';
import Footer from '../../Footer';

interface PembayaranProps {
  totalAmount?: number;
  invoiceId?: string;
  namaPenerima?: string;
  ekspedisi?: string;
}

export default function PembayaranComponent({
  totalAmount = 0,
  invoiceId,
  namaPenerima,
  ekspedisi,
}: PembayaranProps) {
  const [copiedRek, setCopiedRek] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  // Rekening Resmi Toko
  const paymentDetails = {
    invoiceNo: invoiceId || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    bank: 'BANK BCA',
    noRek: '0481980827',
    atasNama: 'TITIN PRAMUDYA WATI',
  };

  const handleCopyRek = () => {
    navigator.clipboard.writeText(paymentDetails.noRek.replace(/\s+/g, ''));
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 2000);
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
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

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        {/* STATUS BANNER */}
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.25em] text-neutral-400 block">
            PESANAN TELAH TERCATAT
          </span>
          <h1 className="text-xl sm:text-3xl font-serif uppercase tracking-tight text-neutral-950 leading-snug">
            Selesaikan Pembayaran Anda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Invoice No: <strong className="text-neutral-950 font-mono text-sm px-1.5 py-0.5 bg-neutral-200/60 rounded">{paymentDetails.invoiceNo}</strong>
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-5">
          {/* TIMER EXPIRY */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50/70 border border-amber-200 p-3.5 text-amber-900 text-xs gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Batas Waktu Pembayaran: <strong>1 x 24 Jam</strong></span>
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 self-start sm:self-auto px-2 py-0.5 bg-amber-100/80 rounded">
              Menunggu Transfer
            </span>
          </div>

          {/* NOMINAL TRANSFER */}
          <div className="border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                Total Jumlah Transfer
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight mt-0.5">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                *Transfer tepat sesuai nominal hingga digit terakhir
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyNominal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-xs font-bold text-neutral-800 hover:text-neutral-950 hover:border-neutral-900 transition-all shadow-xs w-full sm:w-auto justify-center"
            >
              {copiedNominal ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNominal ? 'Tersalin' : 'Salin Nominal'}</span>
            </button>
          </div>

          {/* REKENING PEMBAYARAN */}
          <div className="border border-neutral-200 p-4 sm:p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-7 border border-neutral-200 px-1 flex items-center justify-center bg-white">
                  <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain p-0.5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{paymentDetails.bank}</p>
                  <p className="text-xs font-bold text-neutral-900">{paymentDetails.atasNama}</p>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                Akun Resmi
              </span>
            </div>

            <div className="bg-neutral-50 p-3.5 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Nomor Rekening BCA
                </span>
                <span className="font-mono text-lg sm:text-xl font-bold text-neutral-900 tracking-wider block mt-0.5">
                  {paymentDetails.noRek}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRek}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-xs font-bold text-neutral-800 hover:text-neutral-950 hover:border-neutral-900 transition-all shadow-xs w-full sm:w-auto justify-center"
                title="Salin Nomor Rekening"
              >
                {copiedRek ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRek ? 'Tersalin' : 'Salin No. Rekening'}</span>
              </button>
            </div>
          </div>

          {/* PETUNJUK & TOMBOL KONFIRMASI */}
          <div className="pt-2 space-y-3">
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
              Setelah menyelesaikan transfer via ATM, M-Banking, atau Internet Banking, silakan upload bukti transfer agar pesanan langsung diproses.
            </p>

            <Link
              href={`/konfirmasi-pembayaran?invoice=${encodeURIComponent(paymentDetails.invoiceNo)}`}
              className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] py-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-center"
            >
              <FileCheck className="w-4 h-4" />
              <span>Upload Bukti Pembayaran</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/"
              className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 transition-colors block text-center"
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