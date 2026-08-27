'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';


export interface ItemKeranjang {
  id: string;
  title: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image: string;
  weight: number;
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

  // Fetch Pesanan dari Supabase `orders`
  const fetchOrdersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const mappedOrders: Pesanan[] = data.map((o: any) => ({
          id: o.invoice_no || `ORD-${o.id}`,
          pembeli: o.nama_pembeli || 'Pelanggan Almaco',
          whatsapp: o.no_hp || '-',
          produk: 'Detail Pesanan',
          qty: 1,
          hargaProduk: o.total_harga || 0,
          ongkir: o.ongkir || 0,
          total: (o.total_harga || 0) + (o.ongkir || 0),
          alamat: o.alamat_lengkap || '-',
          kota: '-',
          kecamatan: '-',
          status: o.status || 'Menunggu Verifikasi',
          tanggal: o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          metodePembayaran: o.metode_pembayaran || 'MANUAL',
          bukti: o.bukti_transfer,
        }));
        setPesananList(mappedOrders);
      }
    } catch (e) {
      console.error('Fetch Supabase Orders Error:', e);
    }
  };

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

    fetchOrdersFromSupabase();
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

  const tambahPesanan = async (data: Omit<Pesanan, 'id' | 'tanggal' | 'status'>) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `ORD-${dateStr}-${randomId}`;

    const newPesanan: Pesanan = {
      ...data,
      id: invoiceNo,
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

    // Push ke Supabase `orders`
    try {
      await supabase.from('orders').insert([
        {
          invoice_no: invoiceNo,
          nama_pembeli: data.pembeli,
          no_hp: data.whatsapp,
          alamat_lengkap: `${data.alamat}, ${data.kota}`,
          total_harga: data.hargaProduk,
          ongkir: data.ongkir,
          metode_pembayaran: data.metodePembayaran,
          status: 'Menunggu Verifikasi',
        },
      ]);
    } catch (e) {
      console.error('Error insert order to Supabase:', e);
    }
  };

  const updateStatusPesanan = async (id: string, status: Pesanan['status']) => {
    setPesananList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    // Update status di Supabase
    try {
      await supabase.from('orders').update({ status }).eq('invoice_no', id);
    } catch (e) {
      console.error('Error update order status in Supabase:', e);
    }
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






