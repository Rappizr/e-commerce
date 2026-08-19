'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X, Eye, EyeOff, Check } from 'lucide-react';

interface FotoTestimoniItem {
  id: number;
  foto: string;
  tanggal: string;
  tayang: boolean;
}

export default function TestimoniComponent() {
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([
    {
      id: 1,
      foto: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
      tanggal: '19 Agu 2026',
      tayang: true,
    },
    {
      id: 2,
      foto: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      tanggal: '18 Agu 2026',
      tayang: true,
    },
    {
      id: 3,
      foto: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=600&auto=format&fit=crop',
      tanggal: '17 Agu 2026',
      tayang: false,
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSaveFoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFoto) return;

    const newEntry: FotoTestimoniItem = {
      id: Date.now(),
      foto: previewFoto,
      tanggal: '19 Agu 2026',
      tayang: true,
    };

    setFotoTestimoni([newEntry, ...fotoTestimoni]);
    setPreviewFoto(null);
    setShowUploadModal(false);
  };

  const toggleTayang = (id: number) => {
    setFotoTestimoni((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tayang: !t.tayang } : t))
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Hapus foto testimoni ini?')) {
      setFotoTestimoni((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 p-4 shadow-xs">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Galeri Foto Testimoni ({fotoTestimoni.length})
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Unggah tangkapan layar (screenshot) chat WA atau foto asli hasil pemakaian pelanggan.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Foto Testimoni</span>
        </button>
      </div>

      {/* Grid Galeri Foto Testimoni */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {fotoTestimoni.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-xs group"
          >
            {/* Foto Thumbnail */}
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

            {/* Aksi & Kontrol Status */}
            <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center justify-between gap-1.5">
              <button
                onClick={() => toggleTayang(item.id)}
                className={`p-1.5 rounded-[2px] border text-[10px] font-bold uppercase flex items-center gap-1 transition ${
                  item.tayang
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                }`}
                title={item.tayang ? 'Klik untuk sembunyikan' : 'Klik untuk tayangkan'}
              >
                {item.tayang ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{item.tayang ? 'Tayang' : 'Draft'}</span>
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                title="Hapus Foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload Foto Murni */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowUploadModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Upload Foto Testimoni
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoto} className="space-y-4">
              <div className="flex justify-center px-4 py-6 border-2 border-dashed border-neutral-300 bg-neutral-50 relative">
                <div className="space-y-2 text-center">
                  {previewFoto ? (
                    <div className="relative w-36 h-48 mx-auto mb-2 border border-neutral-200 bg-white">
                      <Image src={previewFoto} alt="Preview Foto" fill className="object-contain" />
                    </div>
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                  )}

                  <label className="relative cursor-pointer text-xs font-bold text-neutral-900 hover:underline block">
                    <span>{previewFoto ? 'Ganti Foto' : 'Pilih File Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      required={!previewFoto}
                      onChange={handleFotoUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    PNG, JPG, JPEG maks 5MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-2.5 transition text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!previewFoto}
                  className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 transition text-center shadow-xs disabled:opacity-50"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Foto Ukuran Penuh */}
      {zoomFoto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-4 max-w-sm sm:max-w-md w-full space-y-3 relative shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Pratinjau Foto Testimoni
              </span>
              <button onClick={() => setZoomFoto(null)} className="p-1 text-neutral-500 hover:text-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full bg-neutral-100">
              <Image src={zoomFoto} alt="Foto Testimoni" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}