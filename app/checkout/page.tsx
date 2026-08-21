"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Check } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';
import PembayaranComponent from './component/pembayaran';

export default function CheckoutPage() {
  const router = useRouter();
  const [isDropship, setIsDropship] = useState(false);
  const [useInsurance, setUseInsurance] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [kota, setKota] = useState('');
  const [alamat, setAlamat] = useState('');
  const [selectedBank, setSelectedBank] = useState('mandiri');

  const { cartItems, subtotal, tambahPesanan } = useKeranjang();

  const shippingFee = cartItems.length > 0 ? 24000 : 0;
  const total = subtotal + shippingFee + (useInsurance ? 5000 : 0);

  const handlePay = () => {
    if (!nama || !whatsapp || !kota || !alamat) {
      alert('Mohon lengkapi semua data penerima.');
      return;
    }

    const itemTitles = cartItems.map((i) => `${i.title} (${i.size}, ${i.color}) x${i.qty}`).join(', ');
    const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);

    tambahPesanan({
      pembeli: nama,
      whatsapp: whatsapp,
      produk: itemTitles,
      qty: totalQty,
      hargaProduk: subtotal,
      ongkir: shippingFee,
      total: total,
      alamat: alamat,
      kota: kota,
      kecamatan: '-',
      metodePembayaran: selectedBank.toUpperCase(),
    });


    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return <PembayaranComponent totalAmount={total} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between">
      
      {/* Header Full-Width */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0">
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

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Ke Keranjang</span>
          </Link>

        </div>
      </header>

      {/* Konten Form Checkout */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tight mb-8 text-neutral-900">
          Pembayaran & Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Data Penerima & Pengiriman */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-neutral-200/80 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                <User className="w-5 h-5 text-neutral-800" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                  Data Penerima
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                    No Telepon / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                  Kota atau Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  placeholder="Contoh: Jawa Timur, Kab. Tulungagung, Kec. Bandung"
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merpati No. 12, RT 02/RW 03, Dusun Krajan"
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>


              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dropship"
                  checked={isDropship}
                  onChange={(e) => setIsDropship(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="dropship" className="text-xs text-neutral-600 cursor-pointer">
                  Kirim sebagai Dropshipper
                </label>
              </div>
            </div>

            <div className="bg-white border border-neutral-200/80 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>Dikirim dari: <strong className="text-neutral-900">Tulungagung</strong></span>
                </div>

                <select className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 border-none cursor-pointer uppercase tracking-wider">
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
                <label htmlFor="insurance" className="text-xs text-neutral-600 cursor-pointer">
                  Asuransi Pengiriman (+Rp 5.000)
                </label>
              </div>

              <div className="space-y-4 pt-2">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-2">Belum ada barang di keranjang.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center justify-between border-t border-neutral-100 pt-4">
                      <div className="flex gap-4 items-center">
                        <div className="relative w-16 h-20 bg-neutral-100 shrink-0 border border-neutral-200">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                            {item.title}
                          </h4>
                          <p className="text-xs text-neutral-900 font-bold">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[11px] text-neutral-400 uppercase tracking-wider">
                            Ukuran: {item.size} | Warna: {item.color} (Qty: {item.qty})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-3">
                  <input
                    type="text"
                    placeholder="Tulis Catatan Buat Penjual..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Metode Pembayaran & Rincian Pesanan */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200/80 p-6 md:p-8 space-y-6 shadow-xs sticky top-28">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
                Pilih Metode Pembayaran
              </h3>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Bank Transfer Resmi
                </p>

                <div className="flex items-center justify-between p-3.5 border-2 border-neutral-950 bg-neutral-50/80 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-7 shrink-0 bg-white px-1 border border-neutral-200 flex items-center justify-center">
                      <Image
                        src="/BCA.png"
                        alt="Bank BCA"
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Bank BCA</span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Transfer Manual / Virtual Account</span>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Rincian Pesanan
                </h4>
                <div className="space-y-2 text-xs text-neutral-600 tracking-wider">
                  <div className="flex justify-between">
                    <span className="truncate max-w-56">Subtotal Produk</span>
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
                  <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Total Tagihan</span>
                    <span className="text-base font-bold text-neutral-950">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePay}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition duration-300 transform hover:scale-[1.01] active:scale-[0.99] block text-center"
              >
                BAYAR SEKARANG
              </button>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}