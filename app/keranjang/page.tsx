'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Minus, 
  Plus, 
  Scale, 
  CheckSquare, 
  Square, 
  Tag, 
  Sparkles, 
  Info 
} from 'lucide-react';
import Footer from '../Footer';
import { useKeranjang } from '../penyimpanan/KeranjangContext';

export default function KeranjangPage() {
  const router = useRouter();

  const { 
    cartItems = [], 
    updateQty, 
    removeItem, 
    hapusItem 
  } = (useKeranjang() as any) || {};

  // Default state [] agar TIDAK OTOMATIS TERCEKLIS ALL
  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>([]);

  // Jaga-jaga bersihkan item centang jika item di keranjang dihapus
  useEffect(() => {
    if (cartItems.length > 0) {
      const allKeys = cartItems.map((item: any) => `${item.id}-${item.size}-${item.color}`);
      setSelectedItemKeys((prev) => prev.filter((key) => allKeys.includes(key)));
    } else {
      setSelectedItemKeys([]);
    }
  }, [cartItems]);

  const handleDelete = (id: string | number, size?: string, color?: string) => {
    const key = `${id}-${size}-${color}`;
    setSelectedItemKeys((prev) => prev.filter((k) => k !== key));

    if (typeof hapusItem === 'function') {
      hapusItem(id, size, color);
    } else if (typeof removeItem === 'function') {
      removeItem(id, size, color);
    }
  };

  const getEcerPrice = (item: any) => {
    const raw = Number(item.rawPrice || item.harga_ecer || item.harga || 0);
    if (raw > 0) return raw;
    return Number(item.price || 0);
  };

  const handleUpdateQty = (item: any, change: number) => {
    const targetQty = item.qty + change;
    if (targetQty <= 0) {
      handleDelete(item.id, item.size, item.color);
      return;
    }

    const ecerPrice = getEcerPrice(item);
    const minGrosir = Number(item.min_grosir || 0);
    const hargaGrosir = Number(item.harga_grosir || 0);

    let calculatedPrice = ecerPrice;

    if (item.is_grosir && minGrosir > 0 && hargaGrosir > 0) {
      if (targetQty >= minGrosir) {
        calculatedPrice = hargaGrosir;
      } else {
        calculatedPrice = ecerPrice;
      }
    }

    if (typeof updateQty === 'function') {
      updateQty(item.id, item.size, item.color, targetQty, calculatedPrice);
    }
  };

  const toggleSelectItem = (key: string) => {
    setSelectedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isAllSelected = cartItems.length > 0 && selectedItemKeys.length === cartItems.length;
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemKeys([]);
    } else {
      const allKeys = cartItems.map((item: any) => `${item.id}-${item.size}-${item.color}`);
      setSelectedItemKeys(allKeys);
    }
  };

  const handleDeleteSelected = () => {
    cartItems.forEach((item: any) => {
      const key = `${item.id}-${item.size}-${item.color}`;
      if (selectedItemKeys.includes(key)) {
        if (typeof hapusItem === 'function') {
          hapusItem(item.id, item.size, item.color);
        } else if (typeof removeItem === 'function') {
          removeItem(item.id, item.size, item.color);
        }
      }
    });
    setSelectedItemKeys([]);
  };

  const selectedCartItems = cartItems.filter((item: any) => {
    const key = `${item.id}-${item.size}-${item.color}`;
    return selectedItemKeys.includes(key);
  });

  const selectedSubtotal = selectedCartItems.reduce((acc: number, item: any) => {
    const ecerPrice = getEcerPrice(item);
    const minGrosir = Number(item.min_grosir || 0);
    const hargaGrosir = Number(item.harga_grosir || 0);

    const isGrosirActive = Boolean(
      item.is_grosir && minGrosir > 0 && hargaGrosir > 0 && item.qty >= minGrosir
    );
    const activeUnitPrice = isGrosirActive ? hargaGrosir : (item.price || ecerPrice);
    return acc + activeUnitPrice * item.qty;
  }, 0);

  const totalGrosirSavings = selectedCartItems.reduce((acc: number, item: any) => {
    const ecerPrice = getEcerPrice(item);
    const minGrosir = Number(item.min_grosir || 0);
    const hargaGrosir = Number(item.harga_grosir || 0);

    const isGrosirActive = Boolean(
      item.is_grosir && minGrosir > 0 && hargaGrosir > 0 && item.qty >= minGrosir
    );
    if (isGrosirActive && ecerPrice > hargaGrosir) {
      return acc + (ecerPrice - hargaGrosir) * item.qty;
    }
    return acc;
  }, 0);

  const selectedTotalWeight = selectedCartItems.reduce(
    (acc: number, item: any) => acc + (Number(item.weight) || 350) * item.qty, 
    0
  );

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) return;
    
    const itemsToPass = selectedCartItems.map((item: any) => {
      const ecerPrice = getEcerPrice(item);
      const minGrosir = Number(item.min_grosir || 0);
      const hargaGrosir = Number(item.harga_grosir || 0);

      const isGrosirActive = Boolean(
        item.is_grosir && minGrosir > 0 && hargaGrosir > 0 && item.qty >= minGrosir
      );
      return {
        ...item,
        price: isGrosirActive ? hargaGrosir : ecerPrice
      };
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('almaco_checkout_items', JSON.stringify(itemsToPass));
    }
    
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
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
            <span className="hidden xs:inline">Lanjut Belanja</span>
            <span className="xs:hidden">Belanja</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif uppercase tracking-tight mb-6 sm:mb-8 text-neutral-900">
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-8 sm:p-14 text-center space-y-4 my-6 shadow-xs">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-300">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                Keranjang Belanja Anda Kosong
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
                Temukan berbagai koleksi daster, gamis, dan busana muslimah elegan kami.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-neutral-950 text-white text-[11px] sm:text-xs uppercase tracking-widest font-bold py-3 px-6 sm:px-8 transition hover:bg-black shadow-xs mt-2"
            >
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              
              <div className="bg-white border border-neutral-200 px-4 py-3 flex items-center justify-between shadow-xs text-xs font-bold uppercase tracking-wider text-neutral-800">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2.5 hover:text-neutral-950 transition cursor-pointer select-none"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-neutral-950" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                  <span>Pilih Semua ({selectedItemKeys.length}/{cartItems.length})</span>
                </button>

                {selectedItemKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih</span>
                  </button>
                )}
              </div>

              {cartItems.map((item: any) => {
                const itemKey = `${item.id}-${item.size}-${item.color}`;
                const isSelected = selectedItemKeys.includes(itemKey);
                const itemUnitWeight = Number(item.weight) || 350;
                const itemTotalWeight = itemUnitWeight * item.qty;

                const ecerPrice = getEcerPrice(item);
                const minGrosir = Number(item.min_grosir || 0);
                const hargaGrosir = Number(item.harga_grosir || 0);

                const isGrosirActive = Boolean(
                  item.is_grosir && minGrosir > 0 && hargaGrosir > 0 && item.qty >= minGrosir
                );
                
                const activeUnitPrice = isGrosirActive ? hargaGrosir : (item.price || ecerPrice);
                const itemSubtotal = activeUnitPrice * item.qty;
                const qtyNeededForGrosir = minGrosir ? minGrosir - item.qty : 0;

                return (
                  <div
                    key={itemKey}
                    className={`bg-white border transition-all p-3.5 sm:p-5 flex flex-col space-y-3 shadow-xs ${
                      isSelected ? 'border-neutral-900 ring-1 ring-neutral-900/10' : 'border-neutral-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                        
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(itemKey)}
                          className="p-1 text-neutral-700 hover:text-neutral-950 transition shrink-0 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-neutral-950" />
                          ) : (
                            <Square className="w-5 h-5 text-neutral-300 hover:text-neutral-500" />
                          )}
                        </button>

                        <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                          <Image 
                            src={item.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop'} 
                            alt={item.title} 
                            fill 
                            className="object-cover" 
                          />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">
                            Ukuran: <strong className="text-neutral-800">{item.size || 'All Size'}</strong> | Warna: <strong className="text-neutral-800">{item.color || 'Default'}</strong>
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-600">
                            <Scale className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>
                              Berat: <strong className="text-neutral-900 font-mono">{itemUnitWeight} gr</strong> / pcs
                              {item.qty > 1 && (
                                <span className="text-neutral-500 font-mono"> (Total: {itemTotalWeight} gr)</span>
                              )}
                            </span>
                          </div>

                          <div className="pt-0.5 flex items-baseline gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-950 font-mono">
                              Rp {activeUnitPrice.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">/ pcs</span>

                            {isGrosirActive && ecerPrice > hargaGrosir && (
                              <span className="text-[10px] text-neutral-400 line-through font-mono">
                                Rp {ecerPrice.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                        <div className="flex items-center border border-neutral-300 rounded bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item, -1)}
                            className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-neutral-300 cursor-pointer active:bg-neutral-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-800 font-mono">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item, 1)}
                            className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-neutral-300 cursor-pointer active:bg-neutral-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm font-bold font-mono text-neutral-950 min-w-20 text-right">
                          Rp {itemSubtotal.toLocaleString('id-ID')}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.size, item.color)}
                          className="text-neutral-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.is_grosir && minGrosir > 0 && (
                      <div className="pt-2">
                        {isGrosirActive ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-emerald-950 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paket Grosir Aktif! Hemat Rp {(ecerPrice - hargaGrosir).toLocaleString('id-ID')} / pcs</span>
                            </div>
                            <span className="bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-2xs font-mono text-[9px]">
                              GROSIR ({item.qty} PCS)
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-xs flex items-center justify-between text-neutral-600 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                Harga Eceran. Tambah <strong className="text-neutral-950 font-bold font-mono">{qtyNeededForGrosir} pcs lagi</strong> untuk Harga Grosir (Rp {hargaGrosir.toLocaleString('id-ID')}/pcs)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item, qtyNeededForGrosir)}
                              className="text-[9px] font-bold uppercase tracking-wider bg-neutral-900 hover:bg-black text-white px-2 py-1 transition cursor-pointer shrink-0 ml-2"
                            >
                              + {qtyNeededForGrosir} PCS
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4 bg-white border border-neutral-200 p-5 sm:p-6 space-y-5 shadow-xs sticky top-24">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3 sm:pb-4">
                RINGKASAN BELANJA
              </h2>
              
              <div className="space-y-2.5 text-xs uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Produk Terpilih</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {selectedItemKeys.length} Item
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    Rp {selectedSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {totalGrosirSavings > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 border border-emerald-200 rounded-xs text-[11px]">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Total Hemat Grosir</span>
                    </span>
                    <span className="font-mono">
                      - Rp {totalGrosirSavings.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Total Berat Terpilih</span>
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono">
                    {selectedTotalWeight} Gram
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Biaya Ongkir</span>
                  <span>Dihitung di Checkout</span>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Total Sementara</span>
                  <span className="text-base font-bold text-neutral-950 font-mono">
                    Rp {selectedSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={selectedItemKeys.length === 0}
                className={`w-full text-xs tracking-[0.2em] font-bold uppercase py-3.5 sm:py-4 flex items-center justify-center gap-2 transition shadow-md text-center ${
                  selectedItemKeys.length > 0
                    ? 'bg-neutral-950 hover:bg-black text-white cursor-pointer'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                }`}
              >
                <span>
                  {selectedItemKeys.length > 0 ? 'Lanjut Ke Checkout' : 'Pilih Produk Dulu'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}