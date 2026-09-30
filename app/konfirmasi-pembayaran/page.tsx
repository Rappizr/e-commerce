"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Footer from "../Footer";
import { supabase } from "../penyimpanan/supabase";

const compressImage = (
  file: File,
  maxDimension = 1000,
  quality = 0.75,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function KonfirmasiContent() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get("invoice") || "";

  const [copied, setCopied] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Default tanggal transfer diset ke waktu sekarang (waktu lokal)
  const getDefaultDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const [formData, setFormData] = useState({
    orderId: invoiceParam.trim().toUpperCase(),
    senderName: "",
    senderBank: "BCA",
    amount: "",
    transferDate: getDefaultDateTime(),
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const rekeningInfo = {
    bank: "BANK BCA",
    noRek: "0481980827",
    atasNama: "TITIN PRAMUDYA WATI",
  };

  useEffect(() => {
    if (!invoiceParam) return;

    const cleanInvoice = invoiceParam.trim();

    const fetchOrderDetails = async () => {
      setIsLoadingOrder(true);
      try {
        let { data, error } = await supabase
          .from("orders")
          .select("nama_pembeli, total, total_harga, bank_asal")
          .ilike("invoice_no", cleanInvoice)
          .single();

        if ((error || !data) && /^\d+$/.test(cleanInvoice)) {
          const fallbackRes = await supabase
            .from("orders")
            .select("nama_pembeli, total, total_harga, bank_asal")
            .eq("id", Number(cleanInvoice))
            .single();
          if (fallbackRes.data) {
            data = fallbackRes.data;
            error = null;
          }
        }

        if (!error && data) {
          setFormData((prev) => ({
            ...prev,
            orderId: cleanInvoice.toUpperCase(),
            senderName: data.nama_pembeli || "",
            amount: String(data.total || data.total_harga || ""),
            senderBank: data.bank_asal || "BCA",
          }));
        }
      } catch (err) {
        console.error("Fetch order detail error:", err);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceParam]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rekeningInfo.noRek.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
      } catch (err) {
        console.error("Gagal memproses gambar:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInvoiceNo = formData.orderId.trim();

    if (!cleanInvoiceNo) {
      setErrorMsg("Nomor Invoice / Order ID harus diisi.");
      return;
    }
    if (!previewImage) {
      setErrorMsg("Silakan unggah foto atau tangkapan layar bukti transfer.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Validasi keberadaan order dengan pencarian fleksibel case-insensitive
      let { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id, invoice_no, total, total_harga, status")
        .ilike("invoice_no", cleanInvoiceNo)
        .single();

      // Fallback: Jika pengguna mengetik angka ID pesanan
      if ((checkError || !existingOrder) && /^\d+$/.test(cleanInvoiceNo)) {
        const fallbackRes = await supabase
          .from("orders")
          .select("id, invoice_no, total, total_harga, status")
          .eq("id", Number(cleanInvoiceNo))
          .single();
        if (fallbackRes.data) {
          existingOrder = fallbackRes.data;
          checkError = null;
        }
      }

      if (checkError || !existingOrder) {
        throw new Error(
          `Pesanan dengan Invoice "${cleanInvoiceNo}" tidak ditemukan. Pastikan nomor invoice sudah sesuai.`,
        );
      }

      // 2. Format tanggal transfer dengan proteksi NaN
      let transferTimestamp: string | null = null;
      if (formData.transferDate) {
        const parsedD = new Date(formData.transferDate);
        if (!isNaN(parsedD.getTime())) {
          transferTimestamp = parsedD.toISOString();
        }
      }

      const parsedAmount = Number(formData.amount.replace(/[^0-9]/g, ""));

      // 3. Simpan update bukti transfer dan informasi pengirim
      const updatePayload: any = {
        bukti_transfer_url: previewImage,
        bukti_transfer: previewImage,
        nama_pengirim: formData.senderName.trim() || null,
        bank_asal: formData.senderBank,
        metode_pembayaran: formData.senderBank,
        status: "Menunggu Verifikasi",
      };

      if (transferTimestamp) {
        updatePayload.tanggal_transfer = transferTimestamp;
      }
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        updatePayload.nominal_transfer = parsedAmount;
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", existingOrder.id);

      if (updateError) throw updateError;

      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Terjadi kesalahan saat mengunggah konfirmasi pembayaran. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10">
      <div className="text-center max-w-lg mx-auto mb-5 sm:mb-8">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1">
          VERIFIKASI TRANSAKSI
        </p>
        <h1 className="text-xl sm:text-2xl font-serif uppercase tracking-tight text-neutral-950 font-bold leading-tight">
          KONFIRMASI PEMBAYARAN
        </h1>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
          Unggah bukti transfer Anda agar pesanan segera kami proses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* KOLOM REKENING */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3 pb-2 border-b border-neutral-100">
              Rekening Tujuan
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-11 h-6 shrink-0 border border-neutral-200 px-1 flex items-center justify-center bg-white rounded-2xs">
                  <Image
                    src="/BCA.png"
                    alt="Bank BCA"
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold leading-none">
                    Nama Bank
                  </p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    {rekeningInfo.bank}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 sm:p-3 border border-neutral-200 flex items-center justify-between gap-2 rounded-2xs">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold leading-none">
                    Nomor Rekening
                  </p>
                  <p className="text-sm sm:text-base font-mono font-bold text-neutral-950 tracking-wider truncate mt-0.5">
                    {rekeningInfo.noRek}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-white shrink-0 cursor-pointer rounded-2xs"
                  title="Salin Nomor Rekening"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold leading-none">
                  Atas Nama
                </p>
                <p className="text-xs font-bold text-neutral-900 mt-0.5">
                  {rekeningInfo.atasNama}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#DFDBCF]/30 border border-neutral-300/60 p-3 sm:p-4 text-xs text-neutral-600 space-y-1 rounded-xs">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px]">
              Petunjuk Konfirmasi:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px] leading-relaxed">
              <li>Pastikan nomor invoice sesuai dengan pesanan Anda.</li>
              <li>Lampirkan foto/screenshot bukti transfer yang jelas.</li>
              <li>Status berubah otomatis saat diverifikasi oleh admin.</li>
            </ul>
          </div>
        </div>

        {/* KOLOM FORMULIR */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 p-4 sm:p-6 shadow-2xs rounded-xs">
          {errorMsg && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                Nomor Pesanan / Invoice ID{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: ORD-2026091901FYP"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderId: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white font-mono tracking-tight rounded-2xs"
                />
                {isLoadingOrder && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                  Nama Pemilik Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pengirim Transfer"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData({ ...formData, senderName: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white rounded-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                  Bank Pengirim <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.senderBank}
                  onChange={(e) =>
                    setFormData({ ...formData, senderBank: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer rounded-2xs"
                >
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  <option value="Lainnya">Bank Lainnya / E-Wallet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                  Jumlah Transfer (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 130000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white font-bold rounded-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                  Tanggal & Jam Transfer <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.transferDate}
                  onChange={(e) =>
                    setFormData({ ...formData, transferDate: e.target.value })
                  }
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white rounded-2xs"
                />
              </div>
            </div>

            {/* UPLOAD STRUK BUKTI TRANSFER */}
            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-600 font-bold block mb-1">
                Upload Bukti Transfer <span className="text-red-500">*</span>
              </label>

              <div className="p-3 border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors bg-neutral-50 rounded-2xs text-center">
                {previewImage ? (
                  <div className="relative w-24 h-32 mx-auto mb-1.5 border border-neutral-200 bg-white rounded-2xs overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Bukti Transfer"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Upload className="mx-auto h-6 w-6 text-neutral-400 mb-1" />
                )}

                <div className="flex text-xs text-neutral-600 justify-center">
                  <label className="cursor-pointer font-bold text-neutral-900 hover:underline">
                    <span>
                      {previewImage ? "Ganti Foto Bukti" : "Pilih File Gambar"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      required={!previewImage}
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">
                  PNG, JPG, JPEG maks 5MB
                </p>
              </div>
            </div>

            {/* TOMBOL SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-[11px] sm:text-xs tracking-wider font-bold uppercase py-3 transition flex items-center justify-center gap-2 shadow-xs rounded-2xs cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim Bukti...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Kirim Konfirmasi Pembayaran
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-5 sm:p-6 space-y-3.5 text-center animate-in zoom-in-95 duration-200 rounded-xs">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Konfirmasi Berhasil Dikirim!
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Bukti transfer untuk pesanan{" "}
                <strong className="text-neutral-900 font-mono">
                  {formData.orderId}
                </strong>{" "}
                telah tersimpan. Tim kami akan segera memverifikasi pesanan
                Anda.
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/"
                className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2.5 transition-colors block text-center shadow-xs rounded-2xs"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function KonfirmasiPembayaranPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
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
                <span className="font-black">ALMACO</span>{" "}
                <span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[8.5px] sm:text-[9.5px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-2.5 sm:px-3 py-1.5 transition-all shadow-xs shrink-0 rounded-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="p-8 text-center text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Memuat formulir...</span>
          </div>
        }
      >
        <KonfirmasiContent />
      </Suspense>

      <Footer />
    </div>
  );
}
