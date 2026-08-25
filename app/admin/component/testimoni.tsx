'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';




interface FotoTestimoniItem {
  id: number;
  foto: string;
  tanggal: string;
  tayang: boolean;
}

export default function TestimoniComponent() {
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([]);

  const fetchTestimonialsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const mapped: FotoTestimoniItem[] = data.map((t: any) => ({
          id: t.id,
          foto: t.foto_url,
          tanggal: t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini',
          tayang: t.tayang ?? true,
        }));
        setFotoTestimoni(mapped);
      }
    } catch (e) {
      console.error('Fetch Supabase Testimonials Error:', e);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('almaco_testimoni_list');
    if (saved) {
      try {
        setFotoTestimoni(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    fetchTestimonialsFromSupabase();
  }, []);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  React.useEffect(() => {
    localStorage.setItem('almaco_testimoni_list', JSON.stringify(fotoTestimoni));
  }, [fotoTestimoni]);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFoto) return;

    const newEntry: FotoTestimoniItem = {
      id: Date.now(),
      foto: previewFoto,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      tayang: true,
    };

    setFotoTestimoni([newEntry, ...fotoTestimoni]);
    setPreviewFoto(null);
    setShowUploadModal(false);

    try {
      await supabase.from('testimonials').insert([
        {
          foto_url: previewFoto,
          tayang: true,
        },
      ]);
    } catch (err) {
      console.error('Error insert testimoni to Supabase:', err);
    }
  };

  const toggleTayang = async (id: number) => {
    const target = fotoTestimoni.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.tayang;

    setFotoTestimoni((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tayang: newStatus } : t))
    );

    try {
      await supabase.from('testimonials').update({ tayang: newStatus }).eq('id', id);
    } catch (err) {
      console.error('Error update tayang status in Supabase:', err);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId !== null) {
      const targetId = deleteTargetId;
      setFotoTestimoni((prev) => prev.filter((t) => t.id !== targetId));
      setDeleteTargetId(null);

      try {
        await supabase.from('testimonials').delete().eq('id', targetId);
      } catch (err) {
        console.error('Error delete testimoni from Supabase:', err);
      }
    }
  };


  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 p-3.5 sm:p-4 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
            Galeri Foto Testimoni ({fotoTestimoni.length})
          </h2>
          <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
            Unggah tangkapan layar chat WA atau foto asli hasil pemakaian pelanggan.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 transition"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Upload Foto</span>
        </button>
      </div>

      {fotoTestimoni.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-8 sm:p-12 text-center text-neutral-400 space-y-3 shadow-xs">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300" />
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">Belum Ada Foto Testimoni</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Upload screenshot chat/ulasan kepuasan pelanggan Anda di sini.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 mt-2 hover:bg-black transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Foto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {fotoTestimoni.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs group"
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
                  title={item.tayang ? 'Klik untuk sembunyikan' : 'Klik untuk tayangkan'}
                >
                  {item.tayang ? <Check className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{item.tayang ? 'Tayang' : 'Draft'}</span>
                </button>

                <button
                  onClick={() => setDeleteTargetId(item.id)}
                  className="p-1 sm:p-1.5 text-neutral-400 hover:text-red-600 transition rounded"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setShowUploadModal(false)}
          />

          <div className="relative z-10 bg-white border border-neutral-200 max-w-sm sm:max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Upload Foto Testimoni
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoto} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-600">File Foto Testimoni *</label>
                
                {previewFoto ? (
                  <div className="relative aspect-[3/4] max-h-56 sm:max-h-64 w-full bg-neutral-100 border border-neutral-300 overflow-hidden group mx-auto">
                    <Image src={previewFoto} alt="Preview Foto Testimoni" fill className="object-cover" />
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
                    <div className="text-center space-y-0.5 sm:space-y-1">
                      <span className="text-[11px] sm:text-xs font-bold text-neutral-900 block">Pilih Foto dari Galeri / File</span>
                      <span className="text-[9px] sm:text-[10px] text-neutral-400">PNG, JPG, WEBP (Maks 5MB)</span>
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

              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 sm:px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!previewFoto}
                  className="px-4 sm:px-5 py-2 bg-neutral-950 hover:bg-black disabled:bg-neutral-300 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomFoto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setZoomFoto(null)}
          />
          <div className="relative z-10 bg-white p-3 sm:p-4 max-w-xs sm:max-w-sm md:max-w-md w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
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

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteTargetId(null)}
          />
          <div className="relative z-10 bg-white p-5 sm:p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-neutral-200">
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Foto Testimoni?
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Foto testimoni ini akan dihapus secara permanen dari daftar galeri.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase py-2 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold uppercase py-2 transition shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}