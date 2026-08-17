"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';



export default function CheckoutPage() {
  const [selectedBank, setSelectedBank] = useState('mandiri');
  const [isDropship, setIsDropship] = useState(false);
  const [useInsurance, setUseInsurance] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const { cartItems, subtotal } = useKeranjang();

  const banks = [
    { id: 'bca', name: 'Bank BCA', label: 'BCA' },
    { id: 'bri', name: 'Bank BRI', label: 'BRI' },
    { id: 'mandiri', name: 'Bank Mandiri', label: 'MANDIRI' },
    { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', label: 'BSI' },
  ];

  const shippingFee = cartItems.length > 0 ? 24000 : 0;
  const total = subtotal + shippingFee + (useInsurance ? 5000 : 0);


  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-neutral-200 shadow-sm">
              <Image src="/LOGO.jpeg" alt="Almaco Logo" fill className="object-cover" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest text-neutral-900 uppercase">
              ALMACO FASHION
            </span>
          </Link>
          <Link href="/keranjang" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors border border-neutral-300 px-4 py-2 hover:border-neutral-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Ke Keranjang</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tight mb-8 text-neutral-900">
          Pembayaran & Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Nama Lengkap</label>
                  <input
                    type="text"
                    defaultValue="Rappi"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">No Telepon / WhatsApp</label>
                  <input
                    type="text"
                    defaultValue="08883199088"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Kota atau Kecamatan</label>
                <input
                  type="text"
                  defaultValue="Papua, Kota Jayapura, Abepura"
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Alamat Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Alamat lengkap Anda"
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
                  <span>Dikirim dari: <strong className="text-neutral-900">Cibiru</strong></span>
                </div>

                <select className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 border-none cursor-pointer uppercase tracking-wider">
                  <option>JNE REG (4-5 Hari)</option>
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
                          <p className="text-xs text-red-600 font-semibold">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[11px] text-neutral-400">
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

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200/80 p-6 md:p-8 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
                Pilih Metode Pembayaran
              </h3>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Bank Transfer
                </p>

                {banks.map((bank) => (
                  <label
                    key={bank.id}
                    className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                      selectedBank === bank.id
                        ? 'border-neutral-900 bg-neutral-50/80 font-semibold'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1">
                        {bank.label}
                      </span>
                      <span className="text-xs text-neutral-800">{bank.name}</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedBank === bank.id}
                      onChange={() => setSelectedBank(bank.id)}
                      className="text-neutral-900 focus:ring-neutral-900"
                    />
                  </label>
                ))}

                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 pt-3">
                  COD (Bayar Di Tempat)
                </p>

                <label
                  className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                    selectedBank === 'cod'
                      ? 'border-neutral-900 bg-neutral-50/80 font-semibold'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-widest uppercase bg-emerald-700 text-white px-2.5 py-1">
                      COD
                    </span>
                    <span className="text-xs text-neutral-800">Cash On Delivery</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedBank === 'cod'}
                    onChange={() => setSelectedBank('cod')}
                    className="text-neutral-900 focus:ring-neutral-900"
                  />
                </label>
              </div>

              <div className="border-t border-neutral-100 pt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Rincian Pesanan
                </h4>
                <div className="space-y-2 text-xs text-neutral-600 tracking-wider">
                  <div className="flex justify-between">
                    <span className="truncate max-w-56">Daster Arab & Gamis Abaya...</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                  {useInsurance && (
                    <div className="flex justify-between">
                      <span>Asuransi</span>
                      <span>Rp 5.000</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Total</span>
                    <span className="text-base text-neutral-900">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Gunakan Kode Kupon:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Masukkan Kode"
                    className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs uppercase focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                  <button className="bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase px-4 transition">
                    Gunakan
                  </button>
                </div>
              </div>

              <button className="w-full bg-[#C49A70] hover:bg-[#b0885e] text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition duration-300 transform hover:scale-[1.01] active:scale-[0.99]">
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




