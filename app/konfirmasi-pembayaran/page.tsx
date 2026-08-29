'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle2, Copy, Check, X, Loader2 } from 'lucide-react';
import Footer from '../Footer';
import { supabase } from '../penyimpanan/supabase';

const compressImage = (file: File, maxDimension = 1000, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
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
  const invoiceParam = searchParams.get('invoice') || '';

  const [copied, setCopied] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    orderId: invoiceParam,
    senderName: '',
    senderBank: 'BCA',
    amount: '',
    transferDate: '',
    notes: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const rekeningInfo = {
    bank: 'BANK BCA',
    noRek: '0481980827',
    atasNama: 'TITIN PRAMUDYA WATI',
  };

  // Ambil detail tagihan otomatis jika invoice ada di URL
  useEffect(() => {
    if (!invoiceParam) return;

    const fetchOrderDetails = async () => {
      setIsLoadingOrder(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('nama_pembeli, total, total_harga, bank_asal')
          .eq('invoice_no', invoiceParam)
          .single();

        if (!error && data) {
          setFormData((prev) => ({
            ...prev,
            orderId: invoiceParam,
            senderName: data.nama_pembeli || '',
            amount: String(data.total || data.total_harga || ''),
            senderBank: data.bank_asal || 'BCA',
          }));
        }
      } catch (err) {
        console.error('Fetch order detail error:', err);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceParam]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rekeningInfo.noRek.replace(/\s+/g, ''));
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
        console.error('Gagal memproses gambar:', err);
      }
    }
  };

  // Simpan bukti transfer ke database Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId.trim()) {
      setErrorMsg('Nomor Invoice / Order ID harus diisi.');
      return;
    }
    if (!previewImage) {
      setErrorMsg('Silakan unggah foto atau tangkapan layar bukti transfer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Cek keberadaan invoice di Supabase
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, invoice_no')
        .eq('invoice_no', formData.orderId.trim())
        .single();

      if (checkError || !existingOrder) {
        throw new Error(`Pesanan dengan Invoice "${formData.orderId.trim()}" tidak ditemukan.`);
      }

      // 2. Perbarui kolom bukti transfer dan status pesanan
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          bukti_transfer_url: previewImage,
          bukti_transfer: previewImage,
          nama_pengirim: formData.senderName.trim() || null,
          bank_asal: formData.senderBank,
          status: 'Menunggu Verifikasi',
          catatan: formData.notes.trim() ? formData.notes.trim() : undefined,
        })
        .eq('id', existingOrder.id);

      if (updateError) throw updateError;

      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah konfirmasi pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold mb-1.5">
          VERIFIKASI TRANSAKSI
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-neutral-950 leading-snug">
          KONFIRMASI PEMBAYARAN
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
          Silakan unggah bukti transfer agar pesanan Anda dapat segera kami verifikasi di panel admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* KOLOM REKENING */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white border border-neutral-200 p-5 sm:p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 pb-3 border-b border-neutral-100">
              Rekening Tujuan
            </h2>

            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-6 sm:w-14 sm:h-7 shrink-0 border border-neutral-200 px-1 flex items-center justify-center bg-white">
                  <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain p-0.5" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Nama Bank</p>
                  <p className="text-xs font-bold text-neutral-900">{rekeningInfo.bank}</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 sm:p-4 border border-neutral-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Nomor Rekening</p>
                  <p className="text-sm sm:text-base font-mono font-bold text-neutral-900 tracking-wider truncate">
                    {rekeningInfo.noRek}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 transition-colors border border-neutral-200 bg-white shrink-0 cursor-pointer"
                  title="Salin Nomor Rekening"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Atas Nama</p>
                <p className="text-xs font-bold text-neutral-900 mt-0.5">{rekeningInfo.atasNama}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#DFDBCF]/40 border border-neutral-300/70 p-4 sm:p-5 text-xs text-neutral-600 space-y-1.5">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] sm:text-[11px]">
              Petunjuk Konfirmasi:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[10px] sm:text-[11px] leading-relaxed">
              <li>Pastikan nomor invoice sesuai dengan pesanan Anda.</li>
              <li>Lampirkan bukti struk/screenshot transfer yang jelas.</li>
              <li>Status pesanan akan berubah otomatis setelah admin memverifikasi.</li>
            </ul>
          </div>
        </div>

        {/* KOLOM FORMULIR */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 p-5 sm:p-8 shadow-xs">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Nomor Pesanan / Invoice ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: ORD-1724000000000"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white font-mono"
                />
                {isLoadingOrder && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Nama Pemilik Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pengirim Transfer"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Bank Pengirim <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.senderBank}
                  onChange={(e) => setFormData({ ...formData, senderBank: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Jumlah Transfer (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 130000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Tanggal Transfer <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Upload Bukti Transfer (Foto / Screenshot) <span className="text-red-500">*</span>
              </label>
              
              <div className="mt-1 flex justify-center px-4 pt-4 pb-5 border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors bg-neutral-50 relative">
                <div className="space-y-1.5 text-center">
                  {previewImage ? (
                    <div className="relative w-28 h-36 mx-auto mb-2 border border-neutral-200 bg-white">
                      <Image src={previewImage} alt="Bukti Transfer" fill className="object-contain" />
                    </div>
                  ) : (
                    <Upload className="mx-auto h-7 w-7 text-neutral-400" />
                  )}
                  
                  <div className="flex text-xs text-neutral-600 justify-center">
                    <label className="relative cursor-pointer font-bold text-neutral-900 hover:underline">
                      <span>{previewImage ? 'Ganti Foto Bukti' : 'Pilih File Gambar'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        required={!previewImage}
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider">PNG, JPG, JPEG maks 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Keterangan tambahan jika diperlukan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-xs tracking-[0.2em] font-bold uppercase py-4 transition flex items-center justify-center gap-2 shadow-md mt-4 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Bukti Transfer...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Konfirmasi Pembayaran</span>
                </>
              )}
            </button>
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

          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Konfirmasi Berhasil Dikirim!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Bukti transfer untuk pesanan <strong className="text-neutral-900 font-mono">{formData.orderId}</strong> telah tersimpan di database. Tim Almaco akan segera memverifikasi pesanan Anda.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 transition-colors block text-center shadow-xs"
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
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0">
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
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={
        <div className="p-12 text-center text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat formulir...</span>
        </div>
      }>
        <KonfirmasiContent />
      </Suspense>

      <Footer />
    </div>
  );
}