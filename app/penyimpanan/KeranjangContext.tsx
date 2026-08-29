'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface ItemKeranjang {
  id: string | number;
  title: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image: string;
  weight?: number;
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
  kecamatan?: string;
  status: 'Menunggu Verifikasi' | 'Menunggu Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
  tanggal: string;
  metodePembayaran: string;
  bukti?: string;
}

interface KeranjangContextType {
  cartItems: ItemKeranjang[];
  tambahKeKeranjang: (item: Omit<ItemKeranjang, 'qty'>, qty?: number) => void;
  updateQty: (id: string | number, size: string, color: string, qtyOrDelta: number) => void;
  removeItem: (id: string | number, size?: string, color?: string) => void;
  hapusItem: (id: string | number, size?: string, color?: string) => void;
  clearCart: () => void;
  kosongkanKeranjang: () => void;
  totalCount: number;
  subtotal: number;
  pesananList: Pesanan[];
  tambahPesanan: (pesananBaru: Omit<Pesanan, 'id' | 'tanggal' | 'status'>) => Promise<string | undefined>;
  updateStatusPesanan: (id: string, status: Pesanan['status']) => Promise<void>;
  refreshPesanan: () => Promise<void>;
}

const KeranjangContext = createContext<KeranjangContextType | undefined>(undefined);

export function KeranjangProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ItemKeranjang[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Ambil data pesanan langsung dari tabel orders Supabase
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
          produk: o.catatan || 'Busana ALMACO',
          qty: 1,
          hargaProduk: Number(o.subtotal || o.total_harga || 0),
          ongkir: Number(o.ongkir || 0),
          total: Number(o.total || o.total_harga || 0),
          alamat: o.alamat_lengkap || '-',
          kota: o.kota || '-',
          kecamatan: o.kecamatan || '-',
          status: o.status || 'Menunggu Verifikasi',
          tanggal: o.created_at
            ? new Date(o.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-',
          metodePembayaran: o.bank_asal || o.metode_pembayaran || 'BCA',
          bukti: o.bukti_transfer_url || o.bukti_transfer,
        }));
        setPesananList(mappedOrders);
      }
    } catch (e) {
      console.error('Fetch Supabase Orders Error:', e);
    }
  };

  // Muat keranjang dari LocalStorage di sisi client
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('almaco_keranjang');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
    fetchOrdersFromSupabase();
  }, []);

  // Simpan keranjang ke LocalStorage setiap ada pembaruan
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('almaco_keranjang', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Tambah item ke keranjang
  const tambahKeKeranjang = (newItem: Omit<ItemKeranjang, 'qty'>, qty = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          String(i.id) === String(newItem.id) &&
          i.size === newItem.size &&
          i.color === newItem.color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [...prev, { ...newItem, qty, weight: newItem.weight || 350 }];
    });
  };

  // Update kuantitas item (presisi target kuantitas)
  const updateQty = (id: string | number, size: string, color: string, targetQty: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id) && item.size === size && item.color === color) {
            const finalQty = Number(targetQty);
            return finalQty > 0 ? { ...item, qty: finalQty } : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // Hapus item dari keranjang
  const removeItem = (id: string | number, size?: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        if (size && color) {
          return !(String(item.id) === String(id) && item.size === size && item.color === color);
        }
        return String(item.id) !== String(id);
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Buat pesanan baru ke Supabase
  const tambahPesanan = async (data: Omit<Pesanan, 'id' | 'tanggal' | 'status'>) => {
    const today = new Date();
    const invoiceNo = `ORD-${Date.now()}`;

    const newPesanan: Pesanan = {
      ...data,
      id: invoiceNo,
      tanggal: today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Menunggu Pembayaran',
    };

    setPesananList((prev) => [newPesanan, ...prev]);
    clearCart();

    try {
      await supabase.from('orders').insert([
        {
          invoice_no: invoiceNo,
          nama_pembeli: data.pembeli,
          no_hp: data.whatsapp,
          alamat_lengkap: `${data.alamat}, ${data.kota}`,
          subtotal: data.hargaProduk,
          ongkir: data.ongkir,
          total: data.total,
          total_harga: data.total,
          bank_asal: data.metodePembayaran || 'BCA',
          status: 'Menunggu Pembayaran',
        },
      ]);
      return invoiceNo;
    } catch (e) {
      console.error('Error insert order to Supabase:', e);
    }
  };

  // Update status pesanan di database
  const updateStatusPesanan = async (id: string, status: Pesanan['status']) => {
    setPesananList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

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
        hapusItem: removeItem, // Alias untuk kompatibilitas
        clearCart,
        kosongkanKeranjang: clearCart, // Alias untuk kompatibilitas
        totalCount,
        subtotal,
        pesananList,
        tambahPesanan,
        updateStatusPesanan,
        refreshPesanan: fetchOrdersFromSupabase,
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