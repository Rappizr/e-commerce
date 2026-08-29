"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User, Check, Plus, ChevronDown, Loader2, Trash2, Minus } from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';
import PembayaranComponent from './component/pembayaran';
import { supabase } from '../penyimpanan/supabase';

interface CourierPricing {
  company: string;
  courier_name: string;
  courier_service_name: string;
  duration: string;
  price: number;
}

interface RajaOngkirCity {
  city_id: string;
  province: string;
  type?: string;
  city_name: string;
  postal_code?: string;
}

export default function CheckoutPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdInvoiceNo, setCreatedInvoiceNo] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Form Field Penerima
  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedBank, setSelectedBank] = useState('bca');

  // RajaOngkir Wilayah
  const [searchCityInput, setSearchCityInput] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cityResults, setCityResults] = useState<RajaOngkirCity[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Ekspedisi
  const [shippingOptions, setShippingOptions] = useState<CourierPricing[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierPricing | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [showCourierDropdown, setShowCourierDropdown] = useState(false);

  const { cartItems = [], subtotal = 0, updateQty, hapusItem, kosongkanKeranjang } = (useKeranjang() as any) || {};
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const courierDropdownRef = useRef<HTMLDivElement | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement | null>(null);
  const shippingAbortControllerRef = useRef<AbortController | null>(null);

  const totalWeight = cartItems.reduce((acc: number, item: any) => acc + (Number(item.weight) || 350) * item.qty, 0);
  const totalWeightKg = totalWeight > 0 ? Math.max(1, Math.ceil(totalWeight / 1000)) : 1;
  const packingFee = cartItems.length > 0 ? totalWeightKg * 3000 : 0;
  const shippingFee = selectedCourier ? selectedCourier.price : 0;
  const total = subtotal + shippingFee + packingFee;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (courierDropdownRef.current && !courierDropdownRef.current.contains(target)) {
        setShowCourierDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRates = useCallback(async (destinationCityId: string) => {
    if (!destinationCityId) return;

    if (shippingAbortControllerRef.current) {
      shippingAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    shippingAbortControllerRef.current = controller;

    setIsLoadingShipping(true);
    setShippingOptions([]);
    setSelectedCourier(null);

    const totalWeight = cartItems.reduce((acc: number, item: any) => acc + (Number(item.weight) || 350) * item.qty, 0);

    try {
      const res = await fetch('/api/rajaongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_city_id: destinationCityId,
          weight: totalWeight,
        }),
        signal: controller.signal,
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }

      if (data && data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        setShippingOptions(data.pricing);
        setSelectedCourier(data.pricing[0]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Gagal mengambil tarif ongkir:', err);
      }
    } finally {
      setIsLoadingShipping(false);
    }
  }, [cartItems]);

  useEffect(() => {
    if (selectedCityId && cartItems.length > 0) {
      fetchRates(selectedCityId);
    }
  }, [cartItems.length, selectedCityId, fetchRates]);

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchCityInput(val);
    setSelectedCityId('');
    setShippingOptions([]);
    setSelectedCourier(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 3) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCity(true);
    setShowCityDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rajaongkir?q=${encodeURIComponent(val)}`);
        const text = await res.text();
        let data: any = { results: [] };
        try {
          data = JSON.parse(text);
        } catch {
          data = { results: [] };
        }
        setCityResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 400);
  };

  const handleSelectCity = (city: RajaOngkirCity) => {
    const formatted = `${city.type ? city.type + ' ' : ''}${city.city_name}${city.province ? ', ' + city.province : ''}`;
    setSearchCityInput(formatted);
    setSelectedCityId(city.city_id);
    setShowCityDropdown(false);
    fetchRates(city.city_id);
  };

  // Submit pesanan langsung ke Supabase
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !whatsapp.trim() || !selectedCityId || !alamat.trim()) {
      alert('Mohon lengkapi data penerima dan kota tujuan.');
      return;
    }

    if (!selectedCourier) {
      alert('Silakan pilih salah satu opsi jasa kirim.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Keranjang belanja kosong.');
      return;
    }

    setIsSubmittingOrder(true);

    const calculatedShipping = selectedCourier.price || 0;
    const calculatedPacking = packingFee;
    const calculatedTotalOngkir = calculatedShipping + calculatedPacking;
    const calculatedTotal = subtotal + calculatedTotalOngkir;
    const inv = `ORD-${Date.now()}`;
    const formattedWa = whatsapp.startsWith('0') ? '62' + whatsapp.slice(1) : whatsapp;

    try {
      // 1. Simpan ke tabel orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            invoice_no: inv,
            nama_pembeli: nama.trim(),
            no_hp: formattedWa,
            alamat_lengkap: `${alamat.trim()} (${searchCityInput})`,
            status: 'Menunggu Pembayaran',
            subtotal: subtotal,
            ongkir: calculatedTotalOngkir,
            total: calculatedTotal,
            total_harga: calculatedTotal,
            bank_asal: selectedBank.toUpperCase(),
            catatan: catatan.trim() || null,
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Simpan setiap item ke order_items
      if (orderData) {
        const orderItemsPayload = cartItems.map((item: any) => ({
          order_id: orderData.id,
          product_id: typeof item.id === 'number' ? item.id : null,
          nama_produk: item.title,
          harga: item.price,
          qty: item.qty,
          warna: item.color || null,
          ukuran: item.size || null,
          gambar: item.image || null,
          subtotal: item.price * item.qty,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
        if (itemsError) throw itemsError;
      }

      setFinalAmount(calculatedTotal);
      setCreatedInvoiceNo(inv);
      if (typeof kosongkanKeranjang === 'function') kosongkanKeranjang();
      setIsSubmitted(true);

    } catch (err: any) {
      console.error('Gagal membuat pesanan ke database:', err);
      alert('Terjadi kesalahan saat menyimpan pesanan: ' + (err.message || 'Silakan coba lagi.'));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isSubmitted) {
    return (
      <PembayaranComponent 
        totalAmount={finalAmount} 
        invoiceId={createdInvoiceNo}
        namaPenerima={nama}
        ekspedisi={selectedCourier ? `${selectedCourier.courier_name} (${selectedCourier.courier_service_name})` : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image src="/logo.png" alt="Almaco Logo" fill priority className="object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Kembali Ke Keranjang</span>
            <span className="sm:hidden">Keranjang</span>
          </Link>
        </div>
      </header>

      {/* FORM CHECKOUT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          PEMBAYARAN & CHECKOUT
        </h1>

        <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <User className="w-4 h-4 text-neutral-800" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
                  DATA PENERIMA
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    NAMA PENERIMA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                    NO WHATSAPP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1 relative" ref={cityDropdownRef}>
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                  KOTA / KABUPATEN TUJUAN <span className="text-red-500">*(KETIK MIN. 3 HURUF)</span>
                </label>
                <div className="relative w-full sm:w-auto" ref={courierDropdownRef}>
                  <button
                    type="button"
                    disabled={isLoadingShipping || shippingOptions.length === 0}
                    onClick={() => setShowCourierDropdown(!showCourierDropdown)}
                    className="w-full sm:w-auto bg-[#0F2137] hover:bg-[#182F4D] text-white text-xs font-bold px-4 py-2.5 rounded-sm flex items-center justify-between gap-3 min-w-[240px] sm:min-w-[320px] shadow-xs cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed transition"
                  >
                    {isLoadingShipping ? (
                      <div className="flex items-center gap-2 mx-auto py-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Memuat Tarif Ekspedisi...</span>
                      </div>
                    ) : selectedCourier ? (
                      <div className="flex items-center justify-between w-full gap-2 text-left">
                        <div className="min-w-0 flex-1">
                          <p className="truncate uppercase font-bold tracking-wide text-[11px] sm:text-xs">
                            {selectedCourier.courier_name} - {selectedCourier.courier_service_name}
                          </p>
                          <p className="text-[10px] text-neutral-300 font-normal">
                            {selectedCourier.duration} • Rp {selectedCourier.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <ChevronDown className={"w-4 h-4 shrink-0 transition-transform duration-200 " + (showCourierDropdown ? "rotate-180" : "")} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="uppercase tracking-wider text-[11px] sm:text-xs font-bold">
                          {shippingOptions.length > 0 ? "PILIJ JASA KIRIM" : "MASUKKAN KOTA TUJUAN"}
                        </span>
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      </div>
                    )}
                  </button>

                  {showCourierDropdown && shippingOptions.length > 0 && (
                    <div className="absolute left-0 sm:left-auto right-0 top-full mt-1.5 w-full sm:w-80 md:w-96 bg-white border border-neutral-300 shadow-2xl rounded-sm z-[70] py-1 max-h-72 overflow-y-auto divide-y divide-neutral-100">
                      {shippingOptions.map((opt, idx) => {
                        const isSelected = selectedCourier?.courier_name === opt.courier_name && selectedCourier?.courier_service_name === opt.courier_service_name;
                        return (
                          <div
                            key={opt.company + "-" + opt.courier_service_name + "-" + idx}
                            onClick={() => {
                              setSelectedCourier(opt);
                              setShowCourierDropdown(false);
                            }}
                            className={"px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors " + (isSelected ? "bg-neutral-900 text-white font-bold" : "hover:bg-neutral-100 text-neutral-800")}
                          >
                            <div className="flex-1 min-w-0 pr-3 text-left">
                              <div className={"font-bold uppercase tracking-wide text-xs " + (isSelected ? "text-white" : "text-neutral-900")}>
                                {opt.courier_name} <span className={isSelected ? "text-neutral-300 font-normal" : "text-neutral-600 font-normal"}>({opt.courier_service_name})</span>
                              </div>
                              <div className={"text-[10px] mt-0.5 " + (isSelected ? "text-neutral-300" : "text-neutral-500")}>
                                Estimasi: {opt.duration}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={isSelected ? "font-bold text-xs sm:text-sm text-emerald-400" : "font-bold text-xs sm:text-sm text-neutral-950"}>
                                Rp {opt.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {cartItems.map((item: any) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-neutral-100 pb-4 last:border-none last:pb-0">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="relative w-16 h-20 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-neutral-500">{item.size || 'All Size'} ({item.color || 'Default'})</p>
                        <p className="text-xs font-bold text-red-600">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => hapusItem && hapusItem(item.id, item.size, item.color)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border border-neutral-300 rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateQty && updateQty(item.id, item.size, item.color, Math.max(1, item.qty - 1))}
                          className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-neutral-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-neutral-800">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty && updateQty(item.id, item.size, item.color, item.qty + 1)}
                          className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-neutral-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tulis Catatan Buat Penjual..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs sticky top-24">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
                METODE PEMBAYARAN
              </h3>

              <div 
                onClick={() => setSelectedBank('bca')}
                className="flex items-center justify-between p-3.5 border-2 border-neutral-950 bg-neutral-50 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-6 shrink-0 bg-white border border-neutral-200 flex items-center justify-center">
                    <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain p-0.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Bank BCA</span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Transfer Manual</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  RINCIAN PESANAN
                </h4>
                <div className="space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-neutral-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({selectedCourier ? selectedCourier.courier_name : "Kurir"})</span>
                    <span className="font-semibold text-neutral-900">
                      {isLoadingShipping ? "Menghitung..." : (selectedCourier ? "Rp " + shippingFee.toLocaleString("id-ID") : "Pilih Kurir")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span>Biaya Packing</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                        {totalWeightKg} kg (Rp 3.000/kg)
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      Rp {packingFee.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Total Tagihan</span>
                    <span className="text-base font-bold text-neutral-950">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedCourier || isLoadingShipping || isSubmittingOrder}
                className={`w-full text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition flex items-center justify-center gap-2 ${
                  !selectedCourier || isLoadingShipping || isSubmittingOrder
                    ? 'bg-neutral-400 cursor-not-allowed' 
                    : 'bg-neutral-950 hover:bg-black cursor-pointer'
                }`}
              >
                {isSubmittingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSubmittingOrder ? 'MEMPROSES PESANAN...' : 'BAYAR SEKARANG'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}