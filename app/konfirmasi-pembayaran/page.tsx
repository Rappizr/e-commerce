'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle2, Copy, Check, X } from 'lucide-react';
import Footer from '../Footer';

export default function KonfirmasiPembayaranPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    senderName: '',
    senderBank: 'BCA',
    amount: '',
    transferDate: '',
    notes: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const rekeningInfo = {
    bank: 'BANK BCA',
    noRek: '0481980827',
    atasNama: 'TITIN PRAMUDYA WATI',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rekeningInfo.noRek.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      
{/* Header Halaman Full-Width Rata Tepi seperti Beranda */}
<header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
  <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
    
    {/* Logo & Brand Rata Kiri Penuh */}
    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
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

    {/* Tombol Kembali Rata Kanan Penuh */}
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 py-2.5 transition-all duration-200 shadow-xs shrink-0"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Kembali</span>
    </Link>

  </div>
</header>

      {/* Konten Utama */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2">
            VERIFIKASI TRANSAKSI
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif uppercase tracking-tight text-neutral-950">
            KONFIRMASI PEMBAYARAN
          </h1>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Silakan lengkapi formulir di bawah ini setelah melakukan transfer agar pesanan Anda dapat segera kami verifikasi dan kirim.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Informasi Rekening Tujuan */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200/90 p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 pb-3 border-b border-neutral-100">
                Rekening Tujuan
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-7 shrink-0">
                    <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Nama Bank</p>
                    <p className="text-xs font-bold text-neutral-900">{rekeningInfo.bank}</p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Nomor Rekening</p>
                    <p className="text-base font-mono font-bold text-neutral-900 tracking-wider">
                      {rekeningInfo.noRek}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors border border-neutral-200 bg-white"
                    title="Salin Nomor Rekening"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Atas Nama</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{rekeningInfo.atasNama}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#DFDBCF]/40 border border-neutral-300/70 p-5 text-xs text-neutral-600 space-y-2">
              <p className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                Catatan Penting:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Pastikan nominal transfer sesuai hingga 3 digit terakhir.</li>
                <li>Verifikasi otomatis berjalan 5 - 15 menit pada jam operasional.</li>
                <li>Simpan bukti transfer hingga resi pengiriman diterbitkan.</li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Form Konfirmasi */}
          <div className="lg:col-span-7 bg-white border border-neutral-200/90 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Nomor Pesanan / Invoice ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: INV-20260818-091"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Nama Pemilik Rekening Pengirim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai buku tabungan"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Bank Pengirim <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.senderBank}
                    onChange={(e) => setFormData({ ...formData, senderBank: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer transition-colors"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Jumlah Transfer (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 299000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Tanggal & Waktu Transfer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Upload Bukti Pembayaran */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Upload Bukti Transfer (Foto / Screenshot) <span className="text-red-500">*</span>
                </label>
                
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors bg-neutral-50 relative">
                  <div className="space-y-1 text-center">
                    {previewImage ? (
                      <div className="relative w-32 h-32 mx-auto mb-2 border border-neutral-200 bg-white">
                        <Image src={previewImage} alt="Bukti Transfer" fill className="object-contain" />
                      </div>
                    ) : (
                      <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                    )}
                    
                    <div className="flex text-xs text-neutral-600 justify-center">
                      <label className="relative cursor-pointer font-bold text-neutral-900 hover:underline">
                        <span>{previewImage ? 'Ganti Foto' : 'Pilih File Gambar'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          required={!previewImage}
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">PNG, JPG, JPEG maks 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan jika diperlukan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs tracking-[0.2em] font-bold uppercase py-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-md mt-6 active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Konfirmasi Pembayaran</span>
              </button>

            </form>
          </div>

        </div>
      </main>

      {/* Modal Pop-up Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-950">
                Konfirmasi Berhasil Dikirim!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Bukti pembayaran untuk pesanan <strong className="text-neutral-900">{formData.orderId || 'INV-20260818'}</strong> telah kami terima. Tim Almaco akan memverifikasi pesanan Anda dalam waktu 5-15 menit.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3.5 transition-colors block text-center shadow-sm"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}