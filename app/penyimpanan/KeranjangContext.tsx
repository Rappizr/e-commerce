'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface ItemKeranjang {
  id: string | number;
  title: string;
  price: number;        // Harga aktif (Eceran atau Grosir)
  rawPrice: number;     // Acuan Harga Eceran Asli dari database
  qty: number;
  size: string;
  color: string;
  image: string;
  weight?: number;
  is_grosir?: boolean;
  min_grosir?: number | null;
  harga_grosir?: number | null;
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
  tambahKeKeranjang: (item: any, qty?: number) => void;
  updateQty: (id: string | number, size: string, color: string, qtyOrDelta: number, newPrice?: number) => void;
  removeItem: (id: string | number, size?: string, color?: string) => void;
  hapusItem: (id: string | number, size?: string, color?: string) => void;
  hapusItemDaftar: (itemsToRemove: any[]) => void; // DITAMBAHKAN
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

  // 1. Ambil data pesanan dari Supabase
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

  // Muat dari LocalStorage
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

  // Simpan ke LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('almaco_keranjang', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // TAMBAH KE KERANJANG (DENGAN REFRESH SKEMA GROSIR)
  const tambahKeKeranjang = (newItem: any, qty = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          String(i.id) === String(newItem.id) &&
          i.size === newItem.size &&
          i.color === newItem.color
      );

      // Ambil acuan harga eceran asli
      const rawPrice = Number(newItem.rawPrice || newItem.harga || newItem.price || 0);
      const minGrosir = newItem.min_grosir ? Number(newItem.min_grosir) : null;
      const hargaGrosir = newItem.harga_grosir ? Number(newItem.harga_grosir) : null;
      const isGrosirAllowed = Boolean(newItem.is_grosir && minGrosir && hargaGrosir);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + qty;

        // Evaluasi harga grosir
        const isQualifiedGrosir = isGrosirAllowed && newQty >= (minGrosir || 0);
        const activePrice = isQualifiedGrosir ? hargaGrosir! : rawPrice;

        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          price: activePrice,
          rawPrice: rawPrice,
          is_grosir: newItem.is_grosir,
          min_grosir: minGrosir,
          harga_grosir: hargaGrosir,
        };
        return updated;
      } else {
        const isQualifiedGrosir = isGrosirAllowed && qty >= (minGrosir || 0);
        const activePrice = isQualifiedGrosir ? hargaGrosir! : rawPrice;

        return [
          ...prev,
          {
            id: newItem.id,
            title: newItem.title || newItem.nama || 'Busana Almaco',
            price: activePrice,
            rawPrice: rawPrice, // ACUAN PENTING HARGA ECERAN
            qty: qty,
            size: newItem.size || 'All Size',
            color: newItem.color || 'Default',
            image: newItem.image || newItem.gambar_utama || '',
            weight: Number(newItem.weight || newItem.berat || 350),
            is_grosir: newItem.is_grosir,
            min_grosir: minGrosir,
            harga_grosir: hargaGrosir,
          },
        ];
      }
    });
  };

  const updateQty = (
    id: string | number, 
    size: string, 
    color: string, 
    targetQty: number, 
    newPrice?: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id) && item.size === size && item.color === color) {
            const finalQty = Number(targetQty);
            if (finalQty <= 0) return { ...item, qty: 0 };

            // Ambil acuan harga eceran asli
            const rawPrice = item.rawPrice || item.price;
            const minGrosir = item.min_grosir;
            const hargaGrosir = item.harga_grosir;
            const isGrosir = Boolean(item.is_grosir && minGrosir && hargaGrosir);

            let activePrice = item.price;

            // Jika newPrice dikirim dari KeranjangPage, langsung pakai newPrice
            if (newPrice !== undefined) {
              activePrice = newPrice;
            } else if (isGrosir) {
              // Logika fallback: jika Qty < minGrosir, paksa kembali ke rawPrice
              activePrice = finalQty >= minGrosir! ? hargaGrosir! : rawPrice;
            }

            return {
              ...item,
              qty: finalQty,
              price: activePrice, // Memperbarui harga di context
            };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // REMOVE ITEM SINGLE
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

  // FUNGSI BARU: HAPUS DAFTAR ITEM DARI KERANJANG (DIPAKAI SAAT CHECKOUT SUKSES)
  const hapusItemDaftar = (itemsToRemove: any[]) => {
    if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) return;

    setCartItems((prev) =>
      prev.filter(
        (cartItem) =>
          !itemsToRemove.some(
            (target) =>
              String(target.id) === String(cartItem.id) &&
              (target.size ? target.size === cartItem.size : true) &&
              (target.color ? target.color === cartItem.color : true)
          )
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // BUAT PESANAN BARU
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

  // UPDATE STATUS PESANAN
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
        hapusItem: removeItem,
        hapusItemDaftar, // DITAMBAHKAN KAN
        clearCart,
        kosongkanKeranjang: clearCart,
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