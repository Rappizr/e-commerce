"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
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

  const { removeItem, hapusItem, hapusItemDaftar } =
    (useKeranjang() as any) || {};

  // Pembersihan item yang berhasil di-checkout dari session storage dan keranjang (dijalankan 1x saat mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const checkoutSessionItems = sessionStorage.getItem(
          "almaco_checkout_items",
        );
        if (checkoutSessionItems) {
          const parsed = JSON.parse(checkoutSessionItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof hapusItemDaftar === "function") {
              hapusItemDaftar(parsed);
            } else {
              parsed.forEach((item: any) => {
                if (typeof removeItem === "function") {
                  removeItem(item.id, item.size, item.color);
                } else if (typeof hapusItem === "function") {
                  hapusItem(item.id, item.size, item.color);
                }
              });
            }
          }
          sessionStorage.removeItem("almaco_checkout_items");
        }
      } catch (e) {
        console.error("Error clearing checked-out items:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronisasi live data dengan database orders
  useEffect(() => {
    if (!invoiceId) return;

    const fetchOrderDetails = async () => {
      setIsLoadingOrder(true);
      try {
        const cleanInvoice = invoiceId.trim();
        // PERBAIKAN: Hapus kolom 'total' dari select query
        let { data, error } = await supabase
          .from("orders")
          .select("id, invoice_no, total_harga, kurir, nama_pembeli")
          .ilike("invoice_no", cleanInvoice)
          .maybeSingle();

        // Fallback jika invoiceId berupa ID numerik
        if ((error || !data) && /^\d+$/.test(cleanInvoice)) {
          const fallbackRes = await supabase
            .from("orders")
            .select("id, invoice_no, total_harga, kurir, nama_pembeli")
            .eq("id", Number(cleanInvoice))
            .maybeSingle();

          if (fallbackRes.data) {
            data = fallbackRes.data;
            error = null;
          }
        }

        if (!error && data) {
          // PERBAIKAN: Murni menggunakan total_harga
          const nominalDb = Number(data.total_harga || 0);
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

  // Safe clipboard handler untuk kompatibilitas lintas browser & koneksi
  const copyToClipboard = (text: string, callback: () => void) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(callback)
        .catch(() => {
          fallbackCopyTextToClipboard(text, callback);
        });
    } else {
      fallbackCopyTextToClipboard(text, callback);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, callback: () => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      callback();
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyRek = () => {
    copyToClipboard(paymentDetails.noRek.replace(/\s+/g, ""), () => {
      setCopiedRek(true);
      setTimeout(() => setCopiedRek(false), 2000);
    });
  };

  const handleCopyNominal = () => {
    const nominalToCopy = String(liveAmount || totalAmount || 0).replace(
      /[^0-9]/g,
      "",
    );
    copyToClipboard(nominalToCopy, () => {
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    });
  };

  const nominalDisplay = liveAmount > 0 ? liveAmount : totalAmount;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER RINGKAS */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="w-full px-3.5 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-sm sm:text-base uppercase tracking-tight text-neutral-950">
                <span className="font-black tracking-wider">ALMACO</span>{" "}
                <span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[8.5px] sm:text-[9.5px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-stone-300 hover:border-neutral-950 px-2.5 sm:px-3.5 py-1.5 transition-all shadow-2xs shrink-0 rounded-2xs"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER COMPACT */}
      <main className="flex-1 max-w-lg w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
        <div className="text-center space-y-1 mb-3.5 sm:mb-5">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-amber-900 block">
            Pesanan Telah Tercatat
          </span>
          <h1 className="text-lg sm:text-xl font-serif uppercase tracking-tight text-neutral-950 font-bold leading-tight">
            Selesaikan Pembayaran Anda
          </h1>
          <div className="pt-0.5">
            <span className="text-[10.5px] text-neutral-500">Invoice No: </span>
            <strong className="text-neutral-950 font-mono text-[11px] sm:text-xs px-2 py-0.5 bg-[#FAF8F5] border border-stone-300 rounded-2xs inline-block">
              {paymentDetails.invoiceNo}
            </strong>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-3.5 sm:p-5 shadow-2xs space-y-3 rounded-xs">
          {/* TIMER / STATUS */}
          <div className="flex items-center justify-between bg-[#FDFBF7] border border-amber-300/80 p-2.5 text-amber-950 text-[11px] sm:text-xs gap-2 rounded-2xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>
                Batas Waktu: <strong className="font-bold">1 x 24 Jam</strong>
              </span>
            </div>
            <span className="font-bold text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-amber-900 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-2xs whitespace-nowrap">
              Menunggu Transfer
            </span>
          </div>

          {/* DETAIL RINGKAS PENERIMA & EKSPEDISI */}
          {(livePenerima || liveKurir) && (
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAF8F5] border border-stone-200 text-xs rounded-2xs">
              {livePenerima && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3 text-stone-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8.5px] uppercase font-bold text-neutral-400 block tracking-wider leading-none">
                      Penerima
                    </span>
                    <span className="font-bold text-neutral-900 truncate block text-[11px] mt-0.5">
                      {livePenerima}
                    </span>
                  </div>
                </div>
              )}
              {liveKurir && (
                <div className="flex items-center gap-2 min-w-0 border-l border-stone-200 pl-2">
                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                    <Truck className="w-3 h-3 text-stone-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8.5px] uppercase font-bold text-neutral-400 block tracking-wider leading-none">
                      Ekspedisi
                    </span>
                    <span className="font-bold text-neutral-900 uppercase truncate block text-[11px] mt-0.5">
                      {liveKurir}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOMINAL TRANSFER */}
          <div className="border border-stone-200 bg-[#FAF8F5] p-3 sm:p-4 rounded-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-amber-900 font-bold block">
                Total Jumlah Transfer
              </span>
              <span className="text-[9px] text-rose-600 font-medium">
                *Transfer tepat sesuai nominal
              </span>
            </div>

            <div className="flex items-baseline justify-between border-y border-stone-200 py-1.5">
              <span className="text-xs font-bold text-neutral-500">Total</span>
              <p className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight font-mono">
                {isLoadingOrder ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-normal">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-900" />
                    Memuat...
                  </span>
                ) : (
                  `Rp ${nominalDisplay.toLocaleString("id-ID")}`
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyNominal}
              className="w-full py-2 bg-white hover:bg-stone-50 border border-stone-300 text-xs font-bold text-neutral-800 transition rounded-2xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              {copiedNominal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                  <span className="text-emerald-700 text-[11px]">
                    Nominal Disalin!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-[11px]">Salin Nominal</span>
                </>
              )}
            </button>
          </div>

          {/* REKENING PEMBAYARAN */}
          <div className="border border-stone-200 p-3 sm:p-4 space-y-2.5 bg-white rounded-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-5 border border-stone-200 px-1 flex items-center justify-center bg-white rounded-2xs">
                  <Image
                    src="/BCA.png"
                    alt="Bank BCA"
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold leading-none">
                    {paymentDetails.bank}
                  </p>
                  <p className="text-[11px] font-bold text-neutral-900 mt-0.5 leading-none">
                    {paymentDetails.atasNama}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[8px] uppercase font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 border border-amber-200 rounded-2xs">
                <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />
                Akun Resmi
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-2.5 border border-stone-200 rounded-2xs space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                  No. Rekening BCA
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-neutral-950 tracking-wider">
                  {paymentDetails.noRek}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyRek}
                className="w-full py-2 bg-white hover:bg-stone-50 border border-stone-300 text-xs font-bold text-neutral-800 transition rounded-2xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
                title="Salin Nomor Rekening"
              >
                {copiedRek ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span className="text-emerald-700 text-[11px]">
                      No. Rekening Disalin!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[11px]">Salin No. Rekening</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TOMBOL AKSI UTAMA */}
          <div className="pt-1 space-y-2">
            <Link
              href={
                invoiceId
                  ? `/konfirmasi-pembayaran?invoice=${encodeURIComponent(invoiceId)}`
                  : "/konfirmasi-pembayaran"
              }
              className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest py-3 transition flex items-center justify-center gap-1.5 shadow-sm rounded-2xs text-center cursor-pointer active:scale-[0.99]"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Sudah Transfer? Upload Bukti</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>

            <Link
              href="/"
              className="w-full bg-white border border-stone-300 hover:border-neutral-900 text-neutral-700 text-[10.5px] font-bold uppercase tracking-wider py-2 transition block text-center cursor-pointer rounded-2xs shadow-2xs"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
