'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2, 
  MessageSquareQuote,
  AlertTriangle 
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface FotoTestimoniItem {
  id: number;
  foto: string;
  tanggal: string;
  tayang: boolean;
}

const compressImage = (file: File, maxDimension = 1000, quality = 0.75): Promise<string> => {
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

export default function TestimoniComponent() {
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data langsung dari tabel 'testimonials' Supabase
  const fetchTestimonialsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: FotoTestimoniItem[] = data.map((t: any) => ({
          id: t.id,
          foto: t.foto_url,
          tanggal: t.created_at
            ? new Date(t.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Baru Saja',
          tayang: t.tayang ?? true,
        }));
        setFotoTestimoni(mapped);
      }
    } catch (e) {
      console.error('Fetch Supabase Testimonials Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonialsFromSupabase();
  }, []);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FotoTestimoniItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        setPreviewFoto(compressed);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // 2. Simpan foto testimoni langsung ke sistem toko
  const handleSaveFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFoto) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([
          {
            foto_url: previewFoto,
            tayang: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: FotoTestimoniItem = {
          id: data.id,
          foto: data.foto_url,
          tanggal: new Date(data.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          tayang: data.tayang ?? true,
        };
        setFotoTestimoni((prev) => [newEntry, ...prev]);
      }

      setPreviewFoto(null);
      setShowUploadModal(false);
      setToastMessage('Foto testimoni berhasil disimpan ke database!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error('Error insert testimoni to Supabase:', err);
      alert('Gagal menyimpan foto: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Toggle status Tayang / Draft di sistem toko
  const toggleTayang = async (id: number) => {
    const target = fotoTestimoni.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.tayang;

    setFotoTestimoni((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tayang: newStatus } : t))
    );

    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ tayang: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error update status in Supabase:', err);
    }
  };

  // 4. Hapus foto testimoni langsung dari sistem toko
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', targetId);

      if (error) throw error;

      setFotoTestimoni((prev) => prev.filter((t) => t.id !== targetId));
      setToastMessage('Foto testimoni berhasil dihapus dari database.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error('Error delete testimoni from Supabase:', err);
      alert('Gagal menghapus testimoni: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full relative">
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-neutral-950 text-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl flex items-center gap-2.5 sm:gap-3 border border-neutral-800 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-[90vw]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">{toastMessage}</p>
        </div>
      )}

      {/* HEADER PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 p-3.5 sm:p-4 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
            Galeri Foto Testimoni ({fotoTestimoni.length})
          </h2>
          <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
            Kelola foto kepuasan pelanggan dan tangkapan layar chat langsung di sistem toko.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Upload Foto Baru</span>
        </button>
      </div>

      {/* DAFTAR FOTO DARI DATABASE */}
      {isLoading ? (
        <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-800" />
          <span className="text-xs uppercase tracking-wider font-semibold">Mengambil Data Testimoni...</span>
        </div>
      ) : fotoTestimoni.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-8 sm:p-12 text-center text-neutral-400 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">Belum Ada Foto Testimoni</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Belum ada ulasan yang diunggah ke sistem toko.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 mt-2 hover:bg-black transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Upload Foto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {fotoTestimoni.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs group hover:border-neutral-400 transition"
            >
              <div
                onClick={() => setZoomFoto(item.foto)}
                className="relative aspect-[3/4] w-full bg-neutral-100 cursor-pointer overflow-hidden"
              >
                <Image
                  src={item.foto}
                  alt="Foto Testimoni"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-neutral-950/80 text-white text-[8px] font-bold uppercase px-1.5 py-0.5">
                  {item.tanggal}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white border-t border-neutral-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => toggleTayang(item.id)}
                  className={`px-2 py-1 rounded-[2px] border text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1 transition ${
                    item.tayang
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                  }`}
                  title={item.tayang ? 'Klik untuk sembunyikan dari pembeli' : 'Klik untuk tayangkan ke pembeli'}
                >
                  {item.tayang ? <Check className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{item.tayang ? 'Tayang' : 'Draft'}</span>
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1 sm:p-1.5 text-neutral-400 hover:text-rose-600 transition rounded"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL UPLOAD FOTO */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => !isProcessing && setShowUploadModal(false)} />

          <div className="relative z-10 bg-white border border-neutral-200 max-w-sm sm:max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Upload Foto Testimoni
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoto} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  File Foto Testimoni <span className="text-red-500">*</span>
                </label>
                
                {previewFoto ? (
                  <div className="relative aspect-[3/4] max-h-56 sm:max-h-64 w-full bg-neutral-100 border border-neutral-300 overflow-hidden group mx-auto">
                    <Image src={previewFoto} alt="Preview Foto Testimoni" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPreviewFoto(null)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md hover:bg-rose-700 transition"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white p-6 sm:p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400" />
                    <div className="text-center space-y-0.5">
                      <span className="text-[11px] sm:text-xs font-bold text-neutral-900 block">
                        Pilih Foto dari Perangkat
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-neutral-400">PNG, JPG, WEBP</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!previewFoto || isProcessing}
                  className="px-4 py-2 bg-neutral-950 hover:bg-black disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan ke Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU FULL */}
      {zoomFoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setZoomFoto(null)} />
          <div className="relative z-10 bg-white p-3 sm:p-4 max-w-sm md:max-w-md w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 truncate">
                Pratinjau Foto Testimoni
              </span>
              <button onClick={() => setZoomFoto(null)} className="p-1 text-neutral-500 hover:text-neutral-900 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full max-h-[65vh] bg-neutral-100 overflow-hidden">
              <Image src={zoomFoto} alt="Foto Testimoni" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Foto Testimoni?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Foto testimoni ini akan dihapus secara permanen dari tabel sistem toko.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase py-2 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase py-2 transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}