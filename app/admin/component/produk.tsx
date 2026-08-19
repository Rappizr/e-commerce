'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';

export default function ProdukComponent() {
  const [produk, setProduk] = useState([
    {
      id: 1,
      nama: 'Daster Arab Renda Rayon Premium',
      kategori: 'Daster',
      harga: 115000,
      stok: 45,
      gambar: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 2,
      nama: 'Gamis Abaya Silk Polos Elegan',
      kategori: 'Gamis',
      harga: 275000,
      stok: 12,
      gambar: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 3,
      nama: 'Setcel Knit Crinkle Kulot',
      kategori: 'Setcel',
      harga: 189000,
      stok: 0,
      gambar: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop',
    },
  ]);

  const handleDelete = (id: number) => {
    if (confirm('Hapus produk ini dari katalog?')) {
      setProduk((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Total {produk.length} Produk
        </h2>
        <button
          onClick={() => alert('Form Tambah Produk')}
          className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {produk.map((item) => (
          <div key={item.id} className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs">
            <div className="relative aspect-[4/3] w-full bg-neutral-100">
              <Image src={item.gambar} alt={item.nama} fill className="object-cover" />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[9px] uppercase font-bold text-neutral-400">{item.kategori}</span>
              <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.nama}</h4>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-neutral-950 text-xs">Rp {item.harga.toLocaleString('id-ID')}</span>
                <span className="text-[11px] text-neutral-500">Stok: {item.stok}</span>
              </div>
            </div>
            <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button 
                onClick={() => handleDelete(item.id)} 
                className="p-1.5 bg-white border border-neutral-300 text-red-600 hover:text-red-700"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}