"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Check } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';
import PembayaranComponent from './component/pembayaran';

export default function CheckoutPage() {
  const [isDropship, setIsDropship] = useState(false);
  const [useInsurance, setUseInsurance] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [kota, setKota] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedBank, setSelectedBank] = useState('bca');

  const { cartItems, subtotal, tambahPesanan } = useKeranjang();

  const shippingFee = cartItems.length > 0 ? 24000 : 0;
  const total = subtotal + shippingFee + (useInsurance ? 5000 : 0);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !whatsapp.trim() || !kota.trim() || !alamat.trim()) {
      alert('Mohon lengkapi semua data penerima yang bertanda bintang (*).');
      return;
    }

    if (cartItems.length === 0) {
      alert('Keranjang belanja Anda masih kosong.');
      return;
    }

    tambahPesanan({
      pembeli: nama,
      whatsapp: whatsapp.startsWith('0') ? '62' + whatsapp.slice(1) : whatsapp,
      produk: itemTitles,
      qty: totalQty,
      hargaProduk: subtotal,
      ongkir: shippingFee,
      total: total,
      alamat: alamat,
      kota: kota,
      kecamatan: kota,
      metodePembayaran: selectedBank.toUpperCase(),
    });

    setIsSubmitted(true);
  };


  if (isSubmitted) {
    return <PembayaranComponent totalAmount={total} />;
  }

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
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1 truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Kembali Ke Keranjang</span>
            <span className="xs:hidden">Keranjang</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-14">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          Pembayaran & Checkout
        </h1>

        <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-neutral-200/80 p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 sm:pb-4">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
                  Data Penerima
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    No Telepon / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                  Kota atau Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  placeholder="Contoh: Jawa Timur, Kab. Tulungagung, Kec. Bandung"
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merpati No. 12, RT 02/RW 03, Dusun Krajan"
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

<<<<<<< HEAD

              <div className="flex items-center gap-2 pt-2">
=======
              <div className="flex items-center gap-2 pt-1">
>>>>>>> e17b229c4dbcb4db6ed962d855466d78ed3d3a96
                <input
                  type="checkbox"
                  id="dropship"
                  checked={isDropship}
                  onChange={(e) => setIsDropship(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="dropship" className="text-xs text-neutral-600 cursor-pointer select-none">
                  Kirim sebagai Dropshipper
                </label>
              </div>
            </div>

            <div className="bg-white border border-neutral-200/80 p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 sm:pb-4 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Dikirim dari: <strong className="text-neutral-900">Tulungagung</strong></span>
                </div>

                <select className="bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 border-none cursor-pointer uppercase tracking-wider">
                  <option>JNE REG (2-4 Hari)</option>
                  <option>J&T Express (2-3 Hari)</option>
                  <option>SiCepat REG (2-4 Hari)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={useInsurance}
                  onChange={(e) => setUseInsurance(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="insurance" className="text-xs text-neutral-600 cursor-pointer select-none">
                  Asuransi Pengiriman (+Rp 5.000)
                </label>
              </div>

              <div className="space-y-3 pt-1">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">Belum ada barang di keranjang.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 sm:gap-4 items-center justify-between border-t border-neutral-100 pt-3">
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="relative w-14 h-18 sm:w-16 sm:h-20 bg-neutral-100 shrink-0 border border-neutral-200">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-neutral-900 font-bold">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider">
                            {item.size} | {item.color} (x{item.qty})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tulis Catatan Buat Penjual..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200/80 p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-xs sticky top-24">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
                Pilih Metode Pembayaran
              </h3>

              <div className="space-y-2.5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Bank Transfer Resmi
                </p>

                <div 
                  onClick={() => setSelectedBank('bca')}
                  className="flex items-center justify-between p-3 sm:p-3.5 border-2 border-neutral-950 bg-neutral-50/80 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-6 sm:w-14 sm:h-7 shrink-0 bg-white px-1 border border-neutral-200 flex items-center justify-center">
                      <Image
                        src="/BCA.png"
                        alt="Bank BCA"
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Bank BCA</span>
                      <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-wider">Transfer Manual / VA</span>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Rincian Pesanan
                </h4>
                <div className="space-y-2 text-xs text-neutral-600 tracking-wider">
                  <div className="flex justify-between">
                    <span className="truncate max-w-44 sm:max-w-56">Subtotal Produk</span>
                    <span className="font-semibold text-neutral-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-neutral-900">Rp {shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                  {useInsurance && (
                    <div className="flex justify-between">
                      <span>Asuransi Pengiriman</span>
                      <span className="font-semibold text-neutral-900">Rp 5.000</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-100 pt-3 flex justify-between text-xs sm:text-sm font-bold text-neutral-900">
                    <span>Total Tagihan</span>
                    <span className="text-sm sm:text-base font-bold text-neutral-950">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
<<<<<<< HEAD
                type="button"
                onClick={handlePay}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition duration-300 transform hover:scale-[1.01] active:scale-[0.99] block text-center"
=======
                type="submit"
                className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase py-3.5 sm:py-4 shadow-md transition duration-300 block text-center"
>>>>>>> e17b229c4dbcb4db6ed962d855466d78ed3d3a96
              >
                BAYAR SEKARANG
              </button>

            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}