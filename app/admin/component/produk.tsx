'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Trash2,
  Pencil, 
  AlertTriangle, 
  X, 
  Check, 
  Upload, 
  PackagePlus, 
  Palette, 
  Loader2,
  Scale 
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

export interface ProdukItem {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  berat: number;
  deskripsi: string;
  rincian: string[];
  warna: string[];
  ukuran: string[];
  gambarList: string[];
  gambarUtama: string;
}

const compressImage = (file: File, maxDimension = 1200, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function ProdukComponent() {
  const [produk, setProduk] = useState<ProdukItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data langsung dari Supabase tabel 'products'
  const fetchProdukFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const mappedProducts: ProdukItem[] = data.map((p: any) => ({
          id: p.id,
          nama: p.nama || 'Busana Almaco',
          kategori: p.kategori || 'Daster',
          harga: Number(p.harga || 0),
          stok: Number(p.stok || 0),
          berat: Number(p.berat || 0),
          deskripsi: p.deskripsi || '',
          rincian: Array.isArray(p.rincian) ? p.rincian : [],
          warna: Array.isArray(p.warna) ? p.warna : [],
          ukuran: Array.isArray(p.ukuran) ? p.ukuran : [],
          gambarList: Array.isArray(p.gambar_list) ? p.gambar_list : (p.gambar_utama ? [p.gambar_utama] : []),
          gambarUtama: p.gambar_utama || '',
        }));
        setProduk(mappedProducts);
      }
    } catch (e) {
      console.error('Fetch Supabase Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdukFromSupabase();
  }, []);

  const [deleteTarget, setDeleteTarget] = useState<ProdukItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ProdukItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [kategoriList, setKategoriList] = useState<string[]>(['Daster', 'Gamis', 'Setcel', 'Abaya']);
  const [newKategoriInput, setNewKategoriInput] = useState('');
  const [showAddKategoriInput, setShowAddKategoriInput] = useState(false);
  const [deleteKategoriTarget, setDeleteKategoriTarget] = useState<string | null>(null);

  const [inputWarnaBaru, setInputWarnaBaru] = useState('');
  const warnaSaran = ['Hitam', 'Putih', 'Cokelat Karamel', 'Mocca', 'Sage Green', 'Navy', 'Maroon', 'Dusty Pink', 'Abu Misty', 'Lilac'];

  const [formProduk, setFormProduk] = useState({
    nama: '',
    kategori: '',
    harga: '',
    stok: '',
    berat: '',
    deskripsi: '',
    rincianText: '',
    warnaList: [] as string[],
    ukuranPilihan: [] as string[],
    gambarList: [] as string[],
  });

  const ukuranTersedia = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];

    const handleOpenEdit = (item: ProdukItem) => {
    setIsEditMode(true);
    setEditingItem(item);
    setFormProduk({
      nama: item.nama,
      kategori: item.kategori,
      harga: String(item.harga),
      stok: String(item.stok),
      berat: item.berat ? String(item.berat) : "",
      deskripsi: item.deskripsi,
      rincianText: (item.rincian || []).join("\n"),
      warnaList: item.warna || [],
      ukuranPilihan: item.ukuran || [],
      gambarList: item.gambarList || [],
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormProduk({
      nama: '',
      kategori: '',
      harga: '',
      stok: '',
      berat: '',
      deskripsi: '',
      rincianText: '',
      warnaList: [],
      ukuranPilihan: [],
      gambarList: [],
    });
    setInputWarnaBaru('');
  };

  const [validationModal, setValidationModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });

  const handleAddKategori = () => {
    const trimmed = newKategoriInput.trim();
    if (!trimmed) return;
    if (kategoriList.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      setValidationModal({
        show: true,
        title: 'Kategori Sudah Ada',
        message: `Kategori "${trimmed}" sudah terdaftar dalam pilihan. Silakan pilih dari daftar yang tersedia.`,
      });
      return;
    }
    const updated = [...kategoriList, trimmed];
    setKategoriList(updated);
    setFormProduk((prev) => ({ ...prev, kategori: trimmed }));
    setNewKategoriInput('');
    setShowAddKategoriInput(false);
    setToastMessage(`Kategori "${trimmed}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDeleteKategori = () => {
    if (!deleteKategoriTarget) return;
    const kat = deleteKategoriTarget;
    const updated = kategoriList.filter((k) => k !== kat);
    setKategoriList(updated);
    if (formProduk.kategori === kat) {
      setFormProduk((prev) => ({ ...prev, kategori: '' }));
    }
    setDeleteKategoriTarget(null);
    setToastMessage(`Kategori "${kat}" berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputWarnaBaru.trim();
    if (!trimmed) return;

    if (formProduk.warnaList.some((w) => w.toLowerCase() === trimmed.toLowerCase())) {
      setInputWarnaBaru('');
      return;
    }

    setFormProduk((prev) => ({
      ...prev,
      warnaList: [...prev.warnaList, trimmed],
    }));
    setInputWarnaBaru('');
  };

  const toggleWarnaPreset = (warna: string) => {
    setFormProduk((prev) => {
      const exists = prev.warnaList.some((w) => w.toLowerCase() === warna.toLowerCase());
      if (exists) {
        return {
          ...prev,
          warnaList: prev.warnaList.filter((w) => w.toLowerCase() !== warna.toLowerCase()),
        };
      }
      return {
        ...prev,
        warnaList: [...prev.warnaList, warna],
      };
    });
  };

  const handleRemoveColor = (warnaToRemove: string) => {
    setFormProduk((prev) => ({
      ...prev,
      warnaList: prev.warnaList.filter((w) => w !== warnaToRemove),
    }));
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const compressedList = await Promise.all(
        Array.from(files).map((file) => compressImage(file, 1200, 0.75))
      );

      setFormProduk((prev) => ({
        ...prev,
        gambarList: [...prev.gambarList, ...compressedList],
      }));

      setToastMessage(`${files.length} foto berhasil ditambahkan!`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setValidationModal({
        show: true,
        title: 'Gagal Memproses Foto',
        message: 'Format foto tidak didukung atau ukuran file terlalu besar.',
      });
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveSingleImage = (indexToRemove: number) => {
    setFormProduk((prev) => ({
      ...prev,
      gambarList: prev.gambarList.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormProduk((prev) => {
      const selected = prev.gambarList[indexToPrimary];
      const others = prev.gambarList.filter((_, idx) => idx !== indexToPrimary);
      return {
        ...prev,
        gambarList: [selected, ...others],
      };
    });
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setFormProduk((prev) => ({ ...prev, harga: '' }));
      return;
    }
    setFormProduk((prev) => ({ ...prev, harga: Number(val).toLocaleString('id-ID') }));
  };

  const toggleUkuran = (size: string) => {
    setFormProduk((prev) => {
      const exists = prev.ukuranPilihan.includes(size);
      if (exists) {
        return { ...prev, ukuranPilihan: prev.ukuranPilihan.filter((s) => s !== size) };
      }
      return { ...prev, ukuranPilihan: [...prev.ukuranPilihan, size] };
    });
  };

  // 2. Tambah produk langsung ke Supabase
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProduk.nama.trim() || !formProduk.harga) {
      setValidationModal({
        show: true,
        title: 'Form Belum Lengkap',
        message: 'Mohon isi Nama Model Busana dan Harga Jual sebelum menyimpan.',
      });
      return;
    }

    if (!formProduk.kategori) {
      setValidationModal({
        show: true,
        title: 'Pilih Kategori Busana',
        message: 'Silakan buat dan klik pilih salah satu Kategori Busana (misal: Daster, Gamis, Abaya) sebelum menyimpan produk.',
      });
      return;
    }

    const rawHarga = Number(formProduk.harga.replace(/[^0-9]/g, ''));
    const parsedRincian = formProduk.rincianText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const fallbackImg = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop';
    const finalList = formProduk.gambarList.length > 0 ? formProduk.gambarList : [fallbackImg];

    const payload = {
      nama: formProduk.nama.trim(),
      kategori: formProduk.kategori,
      harga: rawHarga,
      stok: Number(formProduk.stok) || 0,
      berat: formProduk.berat ? Number(formProduk.berat) : null,
      deskripsi: formProduk.deskripsi.trim() || 'Busana modis berkualitas premium dari ALMACO FASHION.',
      rincian: parsedRincian.length > 0 ? parsedRincian : ['Bahan premium super adem & lembut', 'Jahitan rapi kelas butik'],
      warna: formProduk.warnaList.length > 0 ? formProduk.warnaList : ['Default'],
      ukuran: formProduk.ukuranPilihan.length > 0 ? formProduk.ukuranPilihan : ['All Size'],
      gambar_list: finalList,
      gambar_utama: finalList[0],
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newInsertedItem: ProdukItem = {
          id: data.id,
          nama: data.nama,
          kategori: data.kategori,
          harga: Number(data.harga || 0),
          stok: Number(data.stok || 0),
          berat: Number(data.berat || 0),
          deskripsi: data.deskripsi,
          rincian: data.rincian || [],
          warna: data.warna || [],
          ukuran: data.ukuran || [],
          gambarList: data.gambar_list || [],
          gambarUtama: data.gambar_utama || '',
        };
        setProduk((prev) => [newInsertedItem, ...prev]);
      }

      setShowAddModal(false);
      resetForm();
      setToastMessage(`Produk "${payload.nama}" berhasil diterbitkan ke Database!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e: any) {
      console.error('Error insert product to Supabase:', e);
      alert('Gagal menyimpan produk: ' + e.message);
    }
  };

  // 3. Update stok produk (+ / -) langsung ke Supabase
  const handleUpdateStock = async (id: number, newStock: number) => {
    if (newStock < 0) return;
    setProduk((prev) => prev.map((p) => (p.id === id ? { ...p, stok: newStock } : p)));

    try {
      const { error } = await supabase
        .from('products')
        .update({ stok: newStock })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Gagal update stok:', err);
    }
  };

  // 4. Hapus produk langsung dari Supabase
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.nama;

    try {
      const { error } = await supabase.from('products').delete().eq('id', targetId);
      if (error) throw error;

      setProduk((prev) => prev.filter((p) => p.id !== targetId));
      setToastMessage(`Produk "${targetName}" berhasil dihapus.`);
    } catch (e: any) {
      console.error('Error delete product from Supabase:', e);
      alert('Gagal menghapus produk: ' + e.message);
    } finally {
      setDeleteTarget(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-4 w-full relative">
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-neutral-950 text-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl flex items-center gap-2.5 sm:gap-3 border border-neutral-800 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-[90vw]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">{toastMessage}</p>
        </div>
      )}

      {/* HEADER PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
            Katalog Produk & Galeri
          </h2>
          <p className="text-[10px] sm:text-xs text-neutral-500">
            Kelola data busana, foto galeri, pilihan warna, ukuran, rincian bahan, berat per pcs, dan stok busana toko.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs transition active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* LIST PRODUK DARI SUPABASE */}
      {isLoading ? (
        <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-700" />
          <span className="text-xs uppercase tracking-wider font-semibold">Memuat katalog produk...</span>
        </div>
      ) : produk.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-8 sm:p-14 text-center text-neutral-400 space-y-3 shadow-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <PackagePlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">Katalog Busana Masih Kosong</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
              Belum ada produk di katalog. Mulai tambahkan pakaian sekarang.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2 sm:py-2.5 hover:bg-black transition shadow-xs mt-2"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Mulai Tambah Produk</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {produk.map((item) => (
            <div key={item.id} className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs group hover:border-neutral-400 transition-all duration-200">
              <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                <Image src={item.gambarUtama} alt={item.nama} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/95 px-1.5 sm:px-2 py-0.5 border border-neutral-200 text-neutral-900 shadow-xs">
                  {item.kategori}
                </span>
                <span className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider bg-neutral-950/80 text-white px-1.5 py-0.5 backdrop-blur-xs">
                  {item.gambarList?.length || 1} Foto
                </span>
              </div>
              <div className="p-2.5 sm:p-4 space-y-1">
                <h4 className="text-[11px] sm:text-xs font-bold text-neutral-900 line-clamp-1">{item.nama}</h4>
                <p className="text-[9px] sm:text-[11px] text-neutral-500 line-clamp-1">
                  {item.ukuran.join(', ')} • {item.warna.length} Warna {item.berat ? `• ${item.berat} gr` : ''}
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-1 gap-1">
                  <span className="font-bold text-neutral-950 text-xs">Rp {item.harga.toLocaleString('id-ID')}</span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 border self-start sm:self-auto ${item.stok > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                    Stok: {item.stok}
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-500 hidden sm:inline">Stok:</span>
                  <button
                    onClick={() => handleUpdateStock(item.id, Math.max(0, item.stok - 1))}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateStock(item.id, item.stok + 1)}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-950 text-white hover:bg-black text-[9px] sm:text-[10px] font-bold uppercase transition shadow-xs cursor-pointer"
                    title="Edit Produk"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[9px] sm:text-[10px] font-bold uppercase transition shadow-xs cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden xs:inline">Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH PRODUK BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 bg-white border border-neutral-300 max-w-lg w-full rounded-none shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="p-3.5 sm:p-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                  <PackagePlus className="w-4 h-4 text-neutral-900" />
                  <span>{isEditMode ? "Edit Data Produk" : "Tambah Produk Baru"}</span>
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-neutral-400 hover:text-neutral-900 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              
              {/* UPLOAD FOTO PRODUK */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Foto Produk ({formProduk.gambarList.length})
                  </label>
                  {isCompressing ? (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Memproses...
                    </span>
                  ) : (
                    <label className="text-[10px] font-bold text-neutral-900 hover:underline cursor-pointer inline-flex items-center gap-0.5">
                      <Plus className="w-3 h-3" />
                      <span>Tambah Foto</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {formProduk.gambarList.map((imgSrc, idx) => (
                    <div key={idx} className="relative aspect-[3/4] bg-neutral-100 border border-neutral-300 overflow-hidden group">
                      <Image src={imgSrc} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-neutral-950 text-white text-[7px] font-bold uppercase px-1 py-0.2">
                          Sampul
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute top-1 left-1 bg-white/90 text-neutral-900 text-[7px] font-bold uppercase px-1 py-0.2 opacity-0 group-hover:opacity-100 transition"
                        >
                          Utama
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSingleImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-[3/4] border border-dashed border-neutral-300 hover:border-neutral-950 bg-neutral-50 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition">
                    <Upload className="w-4 h-4 text-neutral-400 mb-0.5" />
                    <span className="text-[9px] font-bold text-neutral-700">Unggah</span>
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* NAMA PRODUK */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Nama Model Busana <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daster Midi Floral Rayon Adem"
                  value={formProduk.nama}
                  onChange={(e) => setFormProduk({ ...formProduk, nama: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950"
                />
              </div>

              {/* 3 KOLOM: HARGA, STOK, BERAT */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 85.000"
                    value={formProduk.harga}
                    onChange={handleHargaChange}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 50"
                    value={formProduk.stok}
                    onChange={(e) => setFormProduk({ ...formProduk, stok: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-neutral-500" />
                    <span>Berat (Gram)</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="Contoh: 325"
                    value={formProduk.berat}
                    onChange={(e) => setFormProduk({ ...formProduk, berat: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950 font-bold"
                  />
                </div>
              </div>

              {/* KATEGORI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddKategoriInput(!showAddKategoriInput)}
                    className="text-[10px] font-bold text-neutral-900 hover:underline inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddKategoriInput ? 'Tutup' : 'Kategori'}</span>
                  </button>
                </div>

                {showAddKategoriInput && (
                  <div className="flex gap-1.5 p-1.5 bg-neutral-100 border border-neutral-200">
                    <input
                      type="text"
                      placeholder="Nama kategori..."
                      value={newKategoriInput}
                      onChange={(e) => setNewKategoriInput(e.target.value)}
                      className="flex-1 bg-white border border-neutral-300 px-2 py-1 text-xs focus:outline-none focus:border-neutral-950"
                    />
                    <button
                      type="button"
                      onClick={handleAddKategori}
                      className="px-2.5 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase"
                    >
                      Simpan
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {kategoriList.map((kat) => {
                    const isSelected = formProduk.kategori === kat;
                    return (
                      <div
                        key={kat}
                        onClick={() => setFormProduk({ ...formProduk, kategori: kat })}
                        className={`group relative inline-flex items-center gap-1 px-2.5 py-1 border text-[10px] font-bold uppercase cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span>{kat}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteKategoriTarget(kat);
                          }}
                          className="p-0.5 rounded hover:bg-rose-600 hover:text-white transition opacity-50 group-hover:opacity-100"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VARIASI WARNA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Variasi Warna ({formProduk.warnaList.length} Warna Terpilih)</span>
                  </label>
                </div>

                {formProduk.warnaList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 border border-neutral-200">
                    {formProduk.warnaList.map((warna) => (
                      <span
                        key={warna}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 text-neutral-900 text-[10px] font-bold uppercase shadow-2xs"
                      >
                        <span>{warna}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(warna)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ketik nama warna baru..."
                    value={inputWarnaBaru}
                    onChange={(e) => setInputWarnaBaru(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    className="flex-1 bg-neutral-50 border border-neutral-300 px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-neutral-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomColor()}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div className="space-y-1 pt-0.5">
                  <span className="text-[9px] text-neutral-400 font-medium">Pilihan cepat:</span>
                  <div className="flex flex-wrap gap-1">
                    {warnaSaran.map((warna) => {
                      const isSelected = formProduk.warnaList.some((w) => w.toLowerCase() === warna.toLowerCase());
                      return (
                        <button
                          key={warna}
                          type="button"
                          onClick={() => toggleWarnaPreset(warna)}
                          className={`px-2 py-0.5 text-[9px] font-semibold border transition ${
                            isSelected
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {isSelected ? `✓ ${warna}` : `+ ${warna}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PILIHAN UKURAN */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Pilihan Ukuran
                </label>
                <div className="flex flex-wrap gap-1">
                  {ukuranTersedia.map((sz) => {
                    const isChecked = formProduk.ukuranPilihan.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleUkuran(sz)}
                        className={`px-2.5 py-1 text-[10px] font-bold border transition ${
                          isChecked
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DESKRIPSI */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={formProduk.deskripsi}
                  onChange={(e) => setFormProduk({ ...formProduk, deskripsi: e.target.value })}
                  placeholder="Deskripsi singkat busana..."
                  className="w-full bg-neutral-50 border border-neutral-300 p-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950"
                />
              </div>

              {/* RINCIAN DETAIL */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Rincian Detail (Poin-poin)
                </label>
                <textarea
                  rows={2}
                  value={formProduk.rincianText}
                  onChange={(e) => setFormProduk({ ...formProduk, rincianText: e.target.value })}
                  placeholder={`Contoh:\nBahan rayon adem\nJahitan rapi butik`}
                  className="w-full bg-neutral-50 border border-neutral-300 p-2 text-xs focus:bg-white focus:outline-none focus:border-neutral-950 font-mono"
                />
              </div>

              {/* TOMBOL AKSI MODAL */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="px-4 py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terbitkan</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL HAPUS KATEGORI */}
      {deleteKategoriTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setDeleteKategoriTarget(null)} />
          <div className="relative z-10 bg-white border border-neutral-200 max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950 truncate">
                  Hapus Kategori
                </h3>
                <p className="text-[10px] text-neutral-500 truncate">Hapus "{deleteKategoriTarget}"?</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori <strong className="text-neutral-900">"{deleteKategoriTarget}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteKategoriTarget(null)}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-bold uppercase"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteKategori}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS PRODUK */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white border border-neutral-200 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                    Konfirmasi Hapus Produk
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">Tindakan ini menghapus data langsung dari database Supabase.</p>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="p-1 text-neutral-400 hover:text-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-neutral-50 border border-neutral-200 flex items-center gap-3">
              <div className="relative w-10 h-10 bg-neutral-200 shrink-0 border border-neutral-300">
                <Image src={deleteTarget.gambarUtama} alt={deleteTarget.nama} fill className="object-cover" />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold text-neutral-900 truncate">{deleteTarget.nama}</p>
                <p className="text-[10px] text-neutral-500">
                  Rp {deleteTarget.harga.toLocaleString('id-ID')} • Stok: {deleteTarget.stok} {deleteTarget.berat ? `• Berat: ${deleteTarget.berat} gr` : ''}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk ini secara permanen dari database?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-bold uppercase"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VALIDASI FORM */}
      {validationModal.show && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                  {validationModal.title}
                </h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Peringatan Input Form</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationModal({ show: false, title: '', message: '' })}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed bg-amber-50/50 p-3 border border-amber-100/80">
              {validationModal.message}
            </p>

            <div className="flex items-center justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setValidationModal({ show: false, title: '', message: '' })}
                className="w-full sm:w-auto px-5 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Paham & Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}