'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, AlertTriangle, X, Check, Upload, PackagePlus } from 'lucide-react';

interface ProdukItem {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambar: string;
}

export default function ProdukComponent() {
  const [produk, setProduk] = useState<ProdukItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProdukItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formProduk, setFormProduk] = useState({
    nama: '',
    kategori: 'Daster',
    harga: '',
    stok: '',
    gambar: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormProduk((prev) => ({ ...prev, gambar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduk.nama || !formProduk.harga) return;

    const newProdukItem: ProdukItem = {
      id: Date.now(),
      nama: formProduk.nama,
      kategori: formProduk.kategori,
      harga: Number(formProduk.harga.replace(/[^0-9]/g, '')),
      stok: Number(formProduk.stok) || 0,
      gambar: formProduk.gambar || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=400&auto=format&fit=crop',
    };

    setProduk([newProdukItem, ...produk]);
    setShowAddModal(false);
    setFormProduk({ nama: '', kategori: 'Daster', harga: '', stok: '', gambar: '' });
    
    setToastMessage(`Produk "${newProdukItem.nama}" berhasil ditambahkan ke katalog.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProduk((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setToastMessage(`Produk "${deleteTarget.nama}" berhasil dihapus.`);
    setDeleteTarget(null);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-neutral-800 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-semibold tracking-wide">{toastMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Total {produk.length} Produk Katalog
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 shadow-xs transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {produk.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-400 space-y-3 shadow-xs">
          <PackagePlus className="w-12 h-12 mx-auto text-neutral-300" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">Belum Ada Produk di Katalog</p>
            <p className="text-[11px] text-neutral-400">Klik tombol "Tambah Produk Baru" di atas untuk menambahkan koleksi busana Anda.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 mt-2 hover:bg-black transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produk.map((item) => (
            <div key={item.id} className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs group hover:border-neutral-400 transition-all duration-200">
              <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                <Image src={item.gambar} alt={item.nama} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold text-neutral-400">{item.kategori}</span>
                <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.nama}</h4>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-neutral-950 text-xs">Rp {item.harga.toLocaleString('id-ID')}</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Stok: {item.stok}</span>
                </div>
              </div>
              <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">Kurangi Stok:</span>
                  <button
                    onClick={() => {
                      if (item.stok > 0) {
                        setProduk((prev) =>
                          prev.map((p) => (p.id === item.id ? { ...p, stok: p.stok - 1 } : p))
                        );
                      }
                    }}
                    className="w-6 h-6 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition"
                    title="Kurangi 1 Stok"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      setProduk((prev) =>
                        prev.map((p) => (p.id === item.id ? { ...p, stok: p.stok + 1 } : p))
                      );
                    }}
                    className="w-6 h-6 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition"
                    title="Tambah 1 Stok"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => setDeleteTarget(item)} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-bold uppercase transition-all shadow-2xs"
                  title="Hapus Produk dari Katalag"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog UI/UX Form Tambah Produk Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-neutral-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                  Tambah Produk Baru
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Nama Produk Busana *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daster Arab Renda Rayon"
                  value={formProduk.nama}
                  onChange={(e) => setFormProduk({ ...formProduk, nama: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Kategori *</label>
                  <select
                    value={formProduk.kategori}
                    onChange={(e) => setFormProduk({ ...formProduk, kategori: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950 uppercase cursor-pointer"
                  >
                    <option value="Daster">Daster</option>
                    <option value="Gamis">Gamis</option>
                    <option value="Setcel">Setcel</option>
                    <option value="Kaftan">Kaftan</option>
                    <option value="Aksesori">Aksesori</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Jumlah Stok *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 25"
                    value={formProduk.stok}
                    onChange={(e) => setFormProduk({ ...formProduk, stok: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Harga Satuan (Rp) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 115000"
                  value={formProduk.harga}
                  onChange={(e) => setFormProduk({ ...formProduk, harga: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Foto Produk Busana *</label>
                
                {formProduk.gambar ? (
                  <div className="relative aspect-[16/9] w-full bg-neutral-100 border border-neutral-300 overflow-hidden group">
                    <Image src={formProduk.gambar} alt="Preview Foto Produk" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormProduk({ ...formProduk, gambar: '' })}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-rose-700 transition"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white p-6 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-6 h-6 text-neutral-400" />
                    <div className="text-center">
                      <span className="text-xs font-bold text-neutral-900 block">Pilih Foto dari Galeri / File</span>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP (Maks 5MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Simpan Produk
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Produk UI/UX */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                    Konfirmasi Hapus Produk
                  </h3>
                  <p className="text-[11px] text-neutral-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="text-neutral-400 hover:text-neutral-900 p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 border border-neutral-200 flex items-center gap-3">
              <div className="relative w-12 h-12 bg-neutral-200 shrink-0 border border-neutral-300">
                <Image src={deleteTarget.gambar} alt={deleteTarget.nama} fill className="object-cover" />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold text-neutral-900 truncate">{deleteTarget.nama}</p>
                <p className="text-[11px] text-neutral-500">
                  Rp {deleteTarget.harga.toLocaleString('id-ID')} • Stok: {deleteTarget.stok}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk ini dari katalog? Produk yang dihapus tidak akan lagi ditampilkan pada etalase toko pelanggan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Ya, Hapus Produk
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
