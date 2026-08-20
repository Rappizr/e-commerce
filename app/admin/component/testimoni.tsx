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
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([]);


  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);

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

  const handleSaveFoto = (e: React.FormEvent) => {
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
      {fotoTestimoni.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-400 space-y-3 shadow-xs">
          <Upload className="w-12 h-12 mx-auto text-neutral-300" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">Belum Ada Foto Testimoni</p>
            <p className="text-[11px] text-neutral-400">Upload screenshot chat/ulasan kepuasan pelanggan Anda di sini.</p>
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
      )}


      {/* Modal Upload Foto Murni */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Upload Foto Testimoni
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFoto} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">File Foto Testimoni *</label>
                
                {previewFoto ? (
                  <div className="relative aspect-[3/4] max-h-64 w-full bg-neutral-100 border border-neutral-300 overflow-hidden group mx-auto">
                    <Image src={previewFoto} alt="Preview Foto Testimoni" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPreviewFoto(null)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-rose-700 transition"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white p-8 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-7 h-7 text-neutral-400" />
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-neutral-900 block">Pilih Foto dari Galeri / File</span>
                      <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP (Maks 5MB)</span>
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!previewFoto}
                  className="px-5 py-2 bg-neutral-950 hover:bg-black disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
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