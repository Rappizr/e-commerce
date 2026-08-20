'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ItemKeranjang {
  id: string;
  title: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image: string;
}

export interface Pesanan {
  id: string;
  pembeli: string;
  whatsapp: string;
  produk: string;
  qty: number;
  hargaProduk: number;
  ongkir: number;
  total: number;
  alamat: string;
  kota: string;
  kecamatan: string;
  status: 'Menunggu Verifikasi' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
  tanggal: string;
  metodePembayaran: string;
  bukti?: string;
}

interface KeranjangContextType {
  cartItems: ItemKeranjang[];
  tambahKeKeranjang: (item: Omit<ItemKeranjang, 'qty'>, qty?: number) => void;
  updateQty: (id: string, size: string, color: string, delta: number) => void;
  removeItem: (id: string, size: string, color: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  pesananList: Pesanan[];
  tambahPesanan: (pesananBaru: Omit<Pesanan, 'id' | 'tanggal' | 'status'>) => void;
  updateStatusPesanan: (id: string, status: Pesanan['status']) => void;
}

const KeranjangContext = createContext<KeranjangContextType | undefined>(undefined);

export function KeranjangProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ItemKeranjang[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('almaco_keranjang');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedPesanan = localStorage.getItem('almaco_pesanan');
      if (savedPesanan) {
        setPesananList(JSON.parse(savedPesanan));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('almaco_keranjang', JSON.stringify(cartItems));
      localStorage.setItem('almaco_pesanan', JSON.stringify(pesananList));
    }
  }, [cartItems, pesananList, isLoaded]);

  const tambahKeKeranjang = (newItem: Omit<ItemKeranjang, 'qty'>, qty = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [...prev, { ...newItem, qty }];
    });
  };

  const updateQty = (id: string, size: string, color: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.size === size && item.color === color) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const tambahPesanan = (data: Omit<Pesanan, 'id' | 'tanggal' | 'status'>) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newPesanan: Pesanan = {
      ...data,
      id: `ORD-${dateStr}-${randomId}`,
      tanggal: today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Menunggu Verifikasi',
    };

    setPesananList((prev) => [newPesanan, ...prev]);
    clearCart();
  };

  const updateStatusPesanan = (id: string, status: Pesanan['status']) => {
    setPesananList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <KeranjangContext.Provider
      value={{
        cartItems,
        tambahKeKeranjang,
        updateQty,
        removeItem,
        clearCart,
        totalCount,
        subtotal,
        pesananList,
        tambahPesanan,
        updateStatusPesanan,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const context = useContext(KeranjangContext);
  if (!context) {
    throw new Error('useKeranjang harus digunakan di dalam KeranjangProvider');
  }
  return context;
}






