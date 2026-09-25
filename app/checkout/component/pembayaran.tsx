"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  Clock,
  FileCheck,
  Loader2,
  Truck,
  User,
  ShieldCheck,
} from "lucide-react";
import Footer from "../../Footer";
import { useKeranjang } from "../../penyimpanan/KeranjangContext";
import { supabase } from "../../penyimpanan/supabase";

interface PembayaranProps {
  totalAmount: number;
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
  const [liveAmount, setLiveAmount] = useState<number>(totalAmount);
  const [liveKurir, setLiveKurir] = useState<string>(ekspedisi || "");
  const [livePenerima, setLivePenerima] = useState<string>(namaPenerima || "");
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const { removeItem } = (useKeranjang() as any) || {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const checkoutSessionItems = sessionStorage.getItem(
          "almaco_checkout_items",
        );
        if (checkoutSessionItems && typeof removeItem === "function") {
          const parsed = JSON.parse(checkoutSessionItems);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              removeItem(item.id, item.size, item.color);
            });
          }
          sessionStorage.removeItem("almaco_checkout_items");
        }
      } catch (e) {
        console.error("Error clearing checked-out items:", e);
      }
    }
  }, [removeItem]);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchOrderDetails = async () => {
      setIsLoadingOrder(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("total, total_harga, kurir, nama_pembeli")
          .eq("invoice_no", invoiceId)
          .single();

        if (!error && data) {
          const nominalDb = Number(data.total || data.total_harga || 0);
          if (nominalDb > 0) {
            setLiveAmount(nominalDb);
          }
          if (data.kurir) {
            setLiveKurir(data.kurir);
          }
          if (data.nama_pembeli) {
            setLivePenerima(data.nama_pembeli);
          }
        }
      } catch (err) {
        console.error("Fetch order payment error:", err);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceId]);

  const paymentDetails = {
    invoiceNo: invoiceId || "MEMUAT INVOICE...",
    bank: "BANK CENTRAL ASIA",
    noRek: "0481980827",
    atasNama: "TITIN PRAMUDYA WATI",
  };

  const handleCopyRek = () => {
    navigator.clipboard.writeText(paymentDetails.noRek.replace(/\s+/g, ""));
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 2000);
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(String(liveAmount || totalAmount));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black tracking-wider">ALMACO</span>
                <span className="font-light text-nuetral-800">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-stone-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-2xs shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Kembali Beranda</span>
            <span className="xs:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.25em] text-amber-900/70 block">
            PESANAN TELAH TERCATAT
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-neutral-950 leading-snug">
            Selesaikan Pembayaran Anda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Invoice No:{" "}
            <strong className="text-amber-950 font-mono text-xs sm:text-sm px-2 py-0.5 bg-stone-200/70 border border-stone-300/80 rounded-2xs">
              {paymentDetails.invoiceNo}
            </strong>
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-5 sm:p-7 shadow-xs space-y-5">
          {/* TIMER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FDFBF7] border border-amber-300/80 p-3.5 text-amber-950 text-xs gap-2 rounded-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                Batas Waktu Pembayaran:{" "}
                <strong className="font-bold">1 x 24 Jam</strong>
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-900 self-start sm:self-auto px-2 py-0.5 bg-amber-100/90 border border-amber-300/70 rounded-2xs">
              Menunggu Transfer
            </span>
          </div>

          {/* DETAIL RINGKAS PENERIMA & EKSPEDISI */}
          {(livePenerima || liveKurir) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-[#FAF8F5] border border-stone-200 text-xs rounded-xs">
              {livePenerima && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-200/80 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-stone-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Penerima
                    </span>
                    <span className="font-bold text-neutral-900 truncate block">
                      {livePenerima}
                    </span>
                  </div>
                </div>
              )}
              {liveKurir && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-200/80 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5 text-stone-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Ekspedisi Pilihan
                    </span>
                    <span className="font-bold text-neutral-900 uppercase truncate block">
                      {liveKurir}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOMINAL TRANSFER */}
          <div className="border border-stone-200 bg-[#FAF8F5] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-900/70 font-bold block">
                Total Jumlah Transfer
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight mt-0.5 flex items-center gap-2 font-mono">
                {isLoadingOrder ? (
                  <span className="flex items-center gap-1.5 text-sm text-neutral-500 font-normal">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-900" />{" "}
                    Menghitung tagihan...
                  </span>
                ) : (
                  `Rp ${Number(liveAmount || totalAmount).toLocaleString("id-ID")}`
                )}
              </p>
              <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                *Transfer tepat sesuai nominal hingga digit terakhir
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyNominal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 hover:border-amber-900 text-xs font-bold text-neutral-800 hover:text-amber-950 transition-all shadow-2xs w-full sm:w-auto justify-center cursor-pointer"
            >
              {copiedNominal ? (
                <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              ) : (
                <Copy className="w-4 h-4 text-stone-600" />
              )}
              <span>{copiedNominal ? "Tersalin" : "Salin Nominal"}</span>
            </button>
          </div>

          {/* REKENING PEMBAYARAN */}
          <div className="border border-stone-200 p-4 sm:p-5 space-y-4 bg-white rounded-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-7 border border-stone-200 px-1 flex items-center justify-center bg-white rounded-2xs">
                  <Image
                    src="/BCA.png"
                    alt="Bank BCA"
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                    {paymentDetails.bank}
                  </p>
                  <p className="text-xs font-bold text-neutral-900">
                    {paymentDetails.atasNama}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-2xs">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                Akun Resmi
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Nomor Rekening BCA
                </span>
                <span className="font-mono text-lg sm:text-xl font-bold text-neutral-950 tracking-wider block mt-0.5">
                  {paymentDetails.noRek}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRek}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 hover:border-amber-900 text-xs font-bold text-neutral-800 hover:text-amber-950 transition-all shadow-2xs w-full sm:w-auto justify-center cursor-pointer"
                title="Salin Nomor Rekening"
              >
                {copiedRek ? (
                  <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <Copy className="w-4 h-4 text-stone-600" />
                )}
                <span>{copiedRek ? "Tersalin" : "Salin No. Rekening"}</span>
              </button>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="pt-2 space-y-3">
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
              Setelah menyelesaikan transfer melalui ATM, M-Banking, atau
              Internet Banking, silakan unggah bukti transfer agar pesanan
              segera kami verifikasi dan kirimkan.
            </p>

            <Link
              href={`/konfirmasi-pembayaran?invoice=${encodeURIComponent(paymentDetails.invoiceNo)}`}
              className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 shadow-md text-center cursor-pointer active:scale-[0.99]"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Upload Bukti Pembayaran</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/"
              className="w-full bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 transition-colors block text-center cursor-pointer shadow-2xs"
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
