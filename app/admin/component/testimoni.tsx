'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Crop,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface FotoTestimoniItem {
  id: number;
  foto: string;
  tanggal: string;
  tayang: boolean;
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function TestimoniComponent() {
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FotoTestimoniItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- KOTAK SELEKSI CROP (DRAGGABLE & RESIZABLE) ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [cropBox, setCropBox] = useState<CropRect>({ x: 40, y: 30, w: 180, h: 240 });
  const [imageLayout, setImageLayout] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const isDraggingBox = useRef(false);
  const isResizingCorner = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialCropBox = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // 1. Ambil data testimoni dari Supabase
  const fetchTestimonialsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, foto_url, created_at, tayang')
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

  // 2. Baca file lokal saat diupload
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setPreviewFoto(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Inisialisasi posisi crop box saat gambar termuat
  const handleImageLoaded = () => {
    if (!imgRef.current || !containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const iRect = imgRef.current.getBoundingClientRect();

    const left = iRect.left - cRect.left;
    const top = iRect.top - cRect.top;
    const width = iRect.width;
    const height = iRect.height;

    setImageLayout({ left, top, width, height });

    // Buat kotak awal rasio 3:4 tepat di tengah gambar
    let boxW = Math.min(width * 0.75, height * 0.75 * 0.75);
    let boxH = (boxW * 4) / 3;

    if (boxH > height * 0.85) {
      boxH = height * 0.85;
      boxW = (boxH * 3) / 4;
    }

    setCropBox({
      x: left + (width - boxW) / 2,
      y: top + (height - boxH) / 2,
      w: boxW,
      h: boxH,
    });
  };

  // 3. Logika Drag Kotak (Geser Box)
  const handleBoxMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingBox.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialCropBox.current = { ...cropBox };
  };

  // 4. Logika Resize Sudut Kotak (Tarik Ujung)
  const handleCornerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizingCorner.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialCropBox.current = { ...cropBox };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBox.current && !isResizingCorner.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    const minX = imageLayout.left;
    const minY = imageLayout.top;
    const maxX = imageLayout.left + imageLayout.width;
    const maxY = imageLayout.top + imageLayout.height;

    if (isDraggingBox.current) {
      let newX = initialCropBox.current.x + deltaX;
      let newY = initialCropBox.current.y + deltaY;

      // Batasi agar kotak tidak keluar dari batas foto
      newX = Math.max(minX, Math.min(newX, maxX - initialCropBox.current.w));
      newY = Math.max(minY, Math.min(newY, maxY - initialCropBox.current.h));

      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizingCorner.current) {
      let newW = initialCropBox.current.w + deltaX;
      let newH = (newW * 4) / 3;

      newW = Math.max(75, newW);
      newH = (newW * 4) / 3;

      if (initialCropBox.current.x + newW <= maxX && initialCropBox.current.y + newH <= maxY) {
        setCropBox((prev) => ({ ...prev, w: newW, h: newH }));
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingBox.current = false;
    isResizingCorner.current = false;
  };

  // 5. Eksekusi Pemotongan Berdasarkan Posisi Kotak (Optimasi Ukuran Ringan)
  const applyCrop = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const scaleFactor = img.naturalWidth / imageLayout.width;

    const sourceX = (cropBox.x - imageLayout.left) * scaleFactor;
    const sourceY = (cropBox.y - imageLayout.top) * scaleFactor;
    const sourceW = cropBox.w * scaleFactor;
    const sourceH = cropBox.h * scaleFactor;

    // Resolusi 360 x 480 px (Rasio 3:4 yang sangat ringan & tajam untuk tampilan carousel)
    canvas.width = 360;
    canvas.height = 480;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      360,
      480
    );

    // Kualitas JPEG 0.6 menghasilkan ukuran file hanya ~30-40 KB
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
    setPreviewFoto(croppedDataUrl);
  };

  // 6. Simpan foto ke database
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
      setRawImageSrc(null);
      setShowUploadModal(false);
      setToastMessage('Foto testimoni berhasil dipangkas dan tersimpan ke katalog toko.');
    } catch (err: any) {
      console.error('Error insert testimoni:', err);
      alert('Gagal menyimpan foto: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle status Tayang / Draft
  const toggleTayang = async (id: number) => {
    const target = fotoTestimoni.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.tayang;

    setFotoTestimoni((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tayang: newStatus } : t))
    );

    try {
      await supabase
        .from('testimonials')
        .update({ tayang: newStatus })
        .eq('id', id);
    } catch (err) {
      console.error('Error update status:', err);
    }
  };

  // Hapus foto testimoni
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;

    try {
      await supabase
        .from('testimonials')
        .delete()
        .eq('id', targetId);

      setFotoTestimoni((prev) => prev.filter((t) => t.id !== targetId));
      setToastMessage('Foto testimoni berhasil dihapus dari sistem toko.');
    } catch (err: any) {
      console.error('Error delete testimoni:', err);
      alert('Gagal menghapus testimoni: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full relative">
      
      {/* MODAL SUKSES TENGAH LAYAR */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setToastMessage(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200/90 shadow-2xl p-6 sm:p-7 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
                Pembaruan Berhasil
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                {toastMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest py-3 transition shadow-xs cursor-pointer active:scale-[0.99]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 p-3.5 sm:p-4 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
            Galeri Foto Testimoni ({fotoTestimoni.length})
          </h2>
          <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
            Pangkas dan geser bagian bukti chat atau foto paket yang ingin ditampilkan ke pembeli.
          </p>
        </div>

        <button
          onClick={() => {
            setRawImageSrc(null);
            setPreviewFoto(null);
            setShowUploadModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload & Pangkas Foto</span>
        </button>
      </div>

      {/* DAFTAR FOTO */}
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
            <p className="text-[10px] sm:text-[11px] text-neutral-400">Silakan unggah foto ulasan pertama Anda.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 mt-2 hover:bg-black transition shadow-xs cursor-pointer"
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
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-neutral-950/80 text-white text-[8px] font-bold uppercase px-1.5 py-0.5">
                  {item.tanggal}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              <div className="p-2 bg-white border-t border-neutral-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => toggleTayang(item.id)}
                  className={`px-2 py-1 rounded-[2px] border text-[9px] font-bold uppercase flex items-center gap-1 transition cursor-pointer ${
                    item.tayang
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {item.tayang ? <Check className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{item.tayang ? 'Tayang' : 'Draft'}</span>
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CROP DENGAN KOTAK SELEKSI YANG DAPAT DIGESER */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => !isProcessing && setShowUploadModal(false)} />

          <div className="relative z-10 bg-white border border-neutral-200 max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Crop className="w-4 h-4 text-neutral-900" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                  {rawImageSrc && !previewFoto ? 'Geser Kotak Pemotong' : 'Upload Foto Testimoni'}
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAHAP 1: PILIH FOTO */}
            {!rawImageSrc && (
              <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                <Upload className="w-7 h-7 text-neutral-400" />
                <div className="text-center space-y-0.5">
                  <span className="text-xs font-bold text-neutral-900 block">
                    Pilih Foto dari Perangkat
                  </span>
                  <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP (Maksimal 5 MB)</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* TAHAP 2: KOTAK SELEKSI YANG DAPAT DIGESER-GESER */}
            {rawImageSrc && !previewFoto && (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] text-amber-900 flex items-center justify-between">
                  <span>💡 <strong>Geser kotak</strong> ke area yang pas, atau <strong>tarik titik sudutnya</strong>.</span>
                  <button
                    type="button"
                    onClick={handleImageLoaded}
                    className="underline text-[10px] uppercase font-bold text-amber-950 hover:opacity-80 ml-2 cursor-pointer shrink-0"
                  >
                    Reset Kotak
                  </button>
                </div>

                {/* AREA CANVAS VIEW */}
                <div
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative w-full h-[380px] sm:h-[420px] bg-neutral-950 overflow-hidden flex items-center justify-center select-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={rawImageSrc}
                    alt="Pangkas"
                    onLoad={handleImageLoaded}
                    draggable={false}
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />

                  {/* KOTAK SELEKSI CROP */}
                  {imageLayout.width > 0 && (
                    <div
                      style={{
                        left: `${cropBox.x}px`,
                        top: `${cropBox.y}px`,
                        width: `${cropBox.w}px`,
                        height: `${cropBox.h}px`,
                      }}
                      onMouseDown={handleBoxMouseDown}
                      className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move z-20"
                    >
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                        <div className="border-r border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div />
                      </div>

                      <div
                        onMouseDown={handleCornerMouseDown}
                        className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-white border-2 border-neutral-950 cursor-se-resize flex items-center justify-center shadow-md rounded-full z-30"
                        title="Tarik untuk memperbesar / memperkecil"
                      >
                        <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setRawImageSrc(null)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 uppercase font-bold cursor-pointer"
                  >
                    Ganti Foto Lain
                  </button>

                  <button
                    type="button"
                    onClick={applyCrop}
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Pangkas Area Kotak</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAHAP 3: HASIL CROP & SIMPAN */}
            {previewFoto && (
              <form onSubmit={handleSaveFoto} className="space-y-3.5">
                <div className="relative aspect-[3/4] max-h-72 w-full bg-neutral-100 border border-neutral-300 overflow-hidden mx-auto">
                  <Image src={previewFoto} alt="Hasil Crop" fill className="object-cover" />
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setPreviewFoto(null)}
                    className="text-[11px] text-neutral-600 hover:text-neutral-950 font-bold uppercase cursor-pointer"
                  >
                    ← Geser Kotak Ulang
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      disabled={isProcessing}
                      className="px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Simpan ke Database</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
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
              <button onClick={() => setZoomFoto(null)} className="p-1 text-neutral-500 hover:text-neutral-900 shrink-0 cursor-pointer">
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
                Foto testimoni ini akan dihapus secara permanen dari database sistem toko.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase py-2 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase py-2 transition shadow-xs cursor-pointer"
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