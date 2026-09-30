"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface ItemKeranjang {
  id: string | number;
  title: string;
  price: number; // Harga aktif
  rawPrice: number; // Acuan harga satuan
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
  status:
    | "Menunggu Verifikasi"
    | "Menunggu Pembayaran"
    | "Diproses"
    | "Dikirim"
    | "Selesai"
    | "Dibatalkan";
  tanggal: string;
  metodePembayaran: string;
  bukti?: string;
}

interface KeranjangContextType {
  cartItems: ItemKeranjang[];
  tambahKeKeranjang: (item: any, qty?: number) => void;
  updateQty: (
    id: string | number,
    param2: number | string,
    param3?: string | number,
    param4?: string | number,
    newPrice?: number,
  ) => void;
  removeItem: (id: string | number, size?: string, color?: string) => void;
  hapusItem: (id: string | number, size?: string, color?: string) => void;
  hapusItemDaftar: (itemsToRemove: any[]) => void;
  clearCart: () => void;
  kosongkanKeranjang: () => void;
  totalCount: number;
  subtotal: number;
  pesananList: Pesanan[];
  tambahPesanan: (
    pesananBaru: Omit<Pesanan, "id" | "tanggal" | "status">,
  ) => Promise<string | undefined>;
  updateStatusPesanan: (id: string, status: Pesanan["status"]) => Promise<void>;
  refreshPesanan: () => Promise<void>;
}

const KeranjangContext = createContext<KeranjangContextType | undefined>(
  undefined,
);

// HELPER GENERATOR INVOICE RESMI: ORD-YYYYMMDD01FYP
export const generateInvoiceNo = async (
  supabaseClient: any,
): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  ).toISOString();

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();

  let nextSequence = 1;
  try {
    const { count, error } = await supabaseClient
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (!error && typeof count === "number") {
      nextSequence = count + 1;
    }
  } catch (err) {
    console.error("Gagal menghitung urutan order hari ini:", err);
  }

  const sequenceStr = String(nextSequence).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSuffix = "";
  for (let i = 0; i < 3; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ORD-${dateStr}${sequenceStr}${randomSuffix}`;
};

export function KeranjangProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ItemKeranjang[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ambil data pesanan dari Supabase
  const fetchOrdersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const mappedOrders: Pesanan[] = data.map((o: any) => ({
          id: o.invoice_no || `ORD-${o.id}`,
          pembeli: o.nama_pembeli || "Pelanggan Almaco",
          whatsapp: o.no_hp || "-",
          produk: o.catatan || "Busana ALMACO",
          qty: 1,
          hargaProduk: Number(o.subtotal || o.total_harga || 0),
          ongkir: Number(o.ongkir || 0),
          total: Number(o.total || o.total_harga || 0),
          alamat: o.alamat_lengkap || "-",
          kota: o.kota || "-",
          kecamatan: o.kecamatan || "-",
          status: o.status || "Menunggu Verifikasi",
          tanggal: o.created_at
            ? new Date(o.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-",
          metodePembayaran: o.bank_asal || o.metode_pembayaran || "BCA",
          bukti: o.bukti_transfer_url || o.bukti_transfer,
        }));
        setPesananList(mappedOrders);
      }
    } catch (e) {
      console.error("Fetch Supabase Orders Error:", e);
    }
  };

  // Muat dari LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("almaco_keranjang");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((item: any) => ({
            ...item,
            qty: parseInt(String(item.qty || 1), 10),
            min_grosir: item.min_grosir
              ? parseInt(String(item.min_grosir), 10)
              : null,
            price: Number(item.price || item.rawPrice || 0),
          }));
          setCartItems(sanitized);
        }
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
      localStorage.setItem("almaco_keranjang", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // TAMBAH KE KERANJANG
  const tambahKeKeranjang = (newItem: any, qty = 1) => {
    const targetSize = String(newItem.size || "All Size").trim();
    const isGrosir = Boolean(newItem.is_grosir);
    const targetColor = isGrosir
      ? "Seri Mix (Campur Warna)"
      : String(newItem.color || "Default").trim();

    const inputQty = parseInt(String(qty || 1), 10);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          String(i.id) === String(newItem.id) &&
          Boolean(i.is_grosir) === isGrosir &&
          String(i.size).trim().toUpperCase() === targetSize.toUpperCase() &&
          String(i.color).trim().toUpperCase() === targetColor.toUpperCase(),
      );

      const rawPrice = Number(
        newItem.rawPrice || newItem.harga || newItem.price || 0,
      );
      const minGrosir = isGrosir
        ? parseInt(String(newItem.min_grosir || 5), 10)
        : null;
      const hargaGrosir = isGrosir
        ? Number(newItem.harga_grosir || rawPrice)
        : null;

      const activePrice = isGrosir ? hargaGrosir || rawPrice : rawPrice;

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = parseInt(
          String(updated[existingIndex].qty || 1),
          10,
        );
        const newQty = currentQty + inputQty;

        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          price: activePrice,
          rawPrice: rawPrice,
          is_grosir: isGrosir,
          min_grosir: minGrosir,
          harga_grosir: hargaGrosir,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: newItem.id,
            title: newItem.title || newItem.nama || "Busana Almaco",
            price: activePrice,
            rawPrice: rawPrice,
            qty: inputQty,
            size: targetSize,
            color: targetColor,
            image: newItem.image || newItem.gambar_utama || "",
            weight: Number(newItem.weight || newItem.berat || 100),
            is_grosir: isGrosir,
            min_grosir: minGrosir,
            harga_grosir: hargaGrosir,
          },
        ];
      }
    });
  };

  // UPDATE KUANTITAS ITEM (AMAT SANGAT PRESISI DETEKSI TIPEDATA)
  const updateQty = (
    id: string | number,
    param2: number | string,
    param3?: string | number,
    param4?: string | number,
    newPrice?: number,
  ) => {
    let targetQty: number;
    let targetSize: string;
    let targetColor: string;

    // Pola A: updateQty(id, targetQty, size, color)
    if (typeof param2 === "number") {
      targetQty = param2;
      targetSize = String(param3 || "All Size")
        .trim()
        .toUpperCase();
      targetColor = String(param4 || "Default")
        .trim()
        .toUpperCase();
    }
    // Pola B: updateQty(id, size, color, targetQty, newPrice)
    else if (typeof param4 === "number") {
      targetSize = String(param2 || "All Size")
        .trim()
        .toUpperCase();
      targetColor = String(param3 || "Default")
        .trim()
        .toUpperCase();
      targetQty = param4;
    }
    // Pola C: String angka untuk param2
    else if (typeof param2 === "string" && /^\d+$/.test(param2.trim())) {
      targetQty = parseInt(param2.trim(), 10);
      targetSize = String(param3 || "All Size")
        .trim()
        .toUpperCase();
      targetColor = String(param4 || "Default")
        .trim()
        .toUpperCase();
    }
    // Pola D: Fallback aman
    else {
      targetSize = String(param2 || "All Size")
        .trim()
        .toUpperCase();
      targetColor = String(param3 || "Default")
        .trim()
        .toUpperCase();
      targetQty = parseInt(String(param4 || 1), 10);
    }

    setCartItems((prev) =>
      prev
        .map((item) => {
          const matchId = String(item.id) === String(id);
          const matchSize =
            String(item.size).trim().toUpperCase() === targetSize;
          const matchColor =
            String(item.color).trim().toUpperCase() === targetColor;

          if (matchId && matchSize && matchColor) {
            const isGrosir = Boolean(item.is_grosir);
            const minGrosir = Math.max(
              1,
              parseInt(String(item.min_grosir || 5), 10),
            );

            let finalQty = targetQty;

            // Batas minimal grosir tidak boleh kurang dari min_grosir
            if (isGrosir && finalQty < minGrosir) {
              finalQty = minGrosir;
            }

            if (finalQty <= 0) return { ...item, qty: 0 };

            const rawPrice = Number(item.rawPrice || item.price || 0);
            const hargaGrosir = item.harga_grosir
              ? Number(item.harga_grosir)
              : rawPrice;

            let activePrice = item.price;
            if (newPrice !== undefined) {
              activePrice = newPrice;
            } else if (isGrosir) {
              activePrice = hargaGrosir;
            } else {
              activePrice = rawPrice;
            }

            return {
              ...item,
              qty: finalQty,
              price: activePrice,
            };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  // REMOVE ITEM SINGLE
  const removeItem = (id: string | number, size?: string, color?: string) => {
    const targetSize = size ? String(size).trim().toUpperCase() : null;
    const targetColor = color ? String(color).trim().toUpperCase() : null;

    setCartItems((prev) =>
      prev.filter((item) => {
        if (targetSize && targetColor) {
          const matchId = String(item.id) === String(id);
          const matchSize =
            String(item.size).trim().toUpperCase() === targetSize;
          const matchColor =
            String(item.color).trim().toUpperCase() === targetColor;
          return !(matchId && matchSize && matchColor);
        }
        return String(item.id) !== String(id);
      }),
    );
  };

  // HAPUS DAFTAR ITEM DARI KERANJANG
  const hapusItemDaftar = (itemsToRemove: any[]) => {
    if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) return;

    setCartItems((prev) =>
      prev.filter(
        (cartItem) =>
          !itemsToRemove.some((target) => {
            const matchId = String(target.id) === String(cartItem.id);
            const matchSize = target.size
              ? String(target.size).trim().toUpperCase() ===
                String(cartItem.size).trim().toUpperCase()
              : true;
            const matchColor = target.color
              ? String(target.color).trim().toUpperCase() ===
                String(cartItem.color).trim().toUpperCase()
              : true;
            return matchId && matchSize && matchColor;
          }),
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // BUAT PESANAN BARU DENGAN FORMAT INVOICE RESMI
  const tambahPesanan = async (
    data: Omit<Pesanan, "id" | "tanggal" | "status">,
  ) => {
    const today = new Date();
    const invoiceNo = await generateInvoiceNo(supabase);

    const newPesanan: Pesanan = {
      ...data,
      id: invoiceNo,
      tanggal: today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "Menunggu Pembayaran",
    };

    setPesananList((prev) => [newPesanan, ...prev]);
    clearCart();

    try {
      await supabase.from("orders").insert([
        {
          invoice_no: invoiceNo,
          nama_pembeli: data.pembeli,
          no_hp: data.whatsapp,
          alamat_lengkap: `${data.alamat}, ${data.kota}`,
          subtotal: data.hargaProduk,
          ongkir: data.ongkir,
          total: data.total,
          total_harga: data.total,
          bank_asal: data.metodePembayaran || "BCA",
          status: "Menunggu Pembayaran",
        },
      ]);
      return invoiceNo;
    } catch (e) {
      console.error("Error insert order to Supabase:", e);
    }
  };

  // UPDATE STATUS PESANAN
  const updateStatusPesanan = async (id: string, status: Pesanan["status"]) => {
    setPesananList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    try {
      await supabase.from("orders").update({ status }).eq("invoice_no", id);
    } catch (e) {
      console.error("Error update order status in Supabase:", e);
    }
  };

  const totalCount = cartItems.reduce(
    (acc, item) => acc + parseInt(String(item.qty || 0), 10),
    0,
  );
  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.price || 0) * parseInt(String(item.qty || 0), 10),
    0,
  );

  return (
    <KeranjangContext.Provider
      value={{
        cartItems,
        tambahKeKeranjang,
        updateQty,
        removeItem,
        hapusItem: removeItem,
        hapusItemDaftar,
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
    throw new Error("useKeranjang harus digunakan di dalam KeranjangProvider");
  }
  return context;
}
