"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  CheckCircle2,
  RotateCw,
  RotateCcw,
  Smartphone,
  Move,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";

interface FotoTestimoniItem {
  id: number;
  foto: string;
  tanggal: string;
  tayang: boolean;
}

export default function TestimoniComponent() {
  const [fotoTestimoni, setFotoTestimoni] = useState<FotoTestimoniItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [zoomFoto, setZoomFoto] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FotoTestimoniItem | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Kontrol Pan & Zoom 9:16
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, foto_url, created_at, tayang")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: FotoTestimoniItem[] = data.map((t: any) => ({
          id: t.id,
          foto: t.foto_url,
          tanggal: t.created_at
            ? new Date(t.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Baru Saja",
          tayang: t.tayang ?? true,
        }));
        setFotoTestimoni(mapped);
      }
    } catch (e) {
      console.error("Fetch Supabase Testimonials Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert("Ukuran gambar melebihi 12 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setPreviewFoto(null);
        resetTransform();
      };
      reader.readAsDataURL(file);
    }
  };

  const clampPan = (newX: number, newY: number, currentZoom: number) => {
    if (!cropFrameRef.current || !imgRef.current) return { x: newX, y: newY };

    const frame = cropFrameRef.current.getBoundingClientRect();
    const naturalRatio =
      imgRef.current.naturalWidth / (imgRef.current.naturalHeight || 1);

    const imgW = frame.width * currentZoom;
    const imgH = imgW / naturalRatio;

    const maxPanX = Math.max(0, (imgW - frame.width) / 2);
    const maxPanY = Math.max(0, (imgH - frame.height) / 2);

    return {
      x: Math.max(-maxPanX, Math.min(newX, maxPanX)),
      y: Math.max(-maxPanY, Math.min(newY, maxPanY)),
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY };
    initialPan.current = { ...pan };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    const targetX = initialPan.current.x + dx;
    const targetY = initialPan.current.y + dy;

    setPan(clampPan(targetX, targetY, zoom));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(1, +(zoom + delta).toFixed(2)), 3);
    setZoom(newZoom);
    setPan((prev) => clampPan(prev.x, prev.y, newZoom));
  };

  const handleCropExecute = () => {
    if (!imgRef.current || !cropFrameRef.current) return;

    const img = imgRef.current;
    const frame = cropFrameRef.current.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    const targetW = 720;
    const targetH = 1280;
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const scaleFactor = targetW / frame.width;

    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const renderW = targetW * zoom;
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const renderH = renderW / naturalRatio;

    const drawX = pan.x * scaleFactor;
    const drawY = pan.y * scaleFactor;

    ctx.drawImage(
      img,
      drawX - renderW / 2,
      drawY - renderH / 2,
      renderW,
      renderH,
    );

    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.88);
    setPreviewFoto(croppedBase64);
  };

  const handleSaveToDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFoto) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .insert([{ foto_url: previewFoto, tayang: true }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: FotoTestimoniItem = {
          id: data.id,
          foto: data.foto_url,
          tanggal: new Date(data.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          tayang: data.tayang ?? true,
        };
        setFotoTestimoni((prev) => [newEntry, ...prev]);
      }

      setPreviewFoto(null);
      setRawImageSrc(null);
      setShowUploadModal(false);
      setToastMessage("Foto testimoni berhasil disimpan.");
    } catch (err: any) {
      console.error("Error insert testimoni:", err);
      alert("Gagal menyimpan testimoni: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTayang = async (id: number) => {
    const target = fotoTestimoni.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.tayang;

    setFotoTestimoni((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tayang: newStatus } : t)),
    );

    try {
      await supabase
        .from("testimonials")
        .update({ tayang: newStatus })
        .eq("id", id);
    } catch (err) {
      console.error("Error update status:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;

    try {
      await supabase.from("testimonials").delete().eq("id", targetId);
      setFotoTestimoni((prev) => prev.filter((t) => t.id !== targetId));
      setToastMessage("Foto testimoni berhasil dihapus.");
    } catch (err: any) {
      console.error("Error delete testimoni:", err);
      alert("Gagal menghapus: " + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 w-full relative">
      {/* TOAST SUKSES */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setToastMessage(null)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white border border-stone-200 shadow-2xl p-5 text-center space-y-3 rounded-xs animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5] text-amber-800" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Pembaruan Berhasil
              </h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 transition rounded-2xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* HEADER PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 p-4 shadow-2xs rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
              <MessageSquareQuote className="w-4 h-4 text-amber-800" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Galeri Foto Testimoni ({fotoTestimoni.length})
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
            Format rasio <strong>9:16 (Story HP)</strong>. Foto pas memenuhi
            layar tanpa garis tepi hitam.
          </p>
        </div>

        <button
          onClick={() => {
            setRawImageSrc(null);
            setPreviewFoto(null);
            resetTransform();
            setShowUploadModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 shadow-xs shrink-0 transition cursor-pointer rounded-2xs active:scale-95"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Upload Foto (9:16)</span>
        </button>
      </div>

      {/* GRID DAFTAR FOTO */}
      {isLoading ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-neutral-400 flex flex-col items-center justify-center gap-2 rounded-xs shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin text-amber-900" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Memuat Katalog Testimoni...
          </span>
        </div>
      ) : fotoTestimoni.length === 0 ? (
        <div className="bg-white border border-stone-200 p-8 sm:p-12 text-center text-stone-400 space-y-3 shadow-2xs rounded-xs">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Belum Ada Foto Testimoni
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 mt-1 transition shadow-xs cursor-pointer rounded-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Mulai Upload Foto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {fotoTestimoni.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-amber-800/60 transition rounded-xs"
            >
              <div
                onClick={() => setZoomFoto(item.foto)}
                className="relative aspect-[9/16] w-full bg-neutral-100 cursor-pointer overflow-hidden"
              >
                <Image
                  src={item.foto}
                  alt="Foto Testimoni"
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 left-1.5 bg-neutral-950/85 text-amber-100 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-2xs">
                  {item.tanggal}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-4 h-4 text-amber-200" />
                </div>
              </div>

              <div className="p-2 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between gap-1">
                <button
                  onClick={() => toggleTayang(item.id)}
                  className={`px-2 py-0.5 rounded-2xs border text-[9px] font-bold uppercase flex items-center gap-1 transition cursor-pointer ${
                    item.tayang
                      ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
                      : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                  }`}
                >
                  {item.tayang ? (
                    <Check className="w-2.5 h-2.5 text-amber-700" />
                  ) : (
                    <EyeOff className="w-2.5 h-2.5" />
                  )}
                  <span>{item.tayang ? "Tayang" : "Draft"}</span>
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xs transition cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL CROP 9:16 (UKURAN COMPACT - PAS LAYAR HP)
         ======================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div
            className="fixed inset-0"
            onClick={() => !isProcessing && setShowUploadModal(false)}
          />

          <div className="relative z-10 bg-white border border-stone-200 w-full max-w-[340px] shadow-2xl rounded-xs flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Ringkas */}
            <div className="px-3.5 py-2.5 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-900" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                  {previewFoto
                    ? "Pratinjau (9:16)"
                    : rawImageSrc
                      ? "Pangkas Foto 9:16"
                      : "Pilih Foto"}
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BODY KONTEN */}
            <div className="bg-[#FAF8F5] p-3 flex flex-col items-center">
              {/* TAHAP 1: UPLOAD */}
              {!rawImageSrc && (
                <div className="w-full py-6">
                  <label className="border-2 border-dashed border-stone-300 hover:border-amber-900 bg-white p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition rounded-2xs text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-amber-800" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                      Pilih Screenshot WhatsApp
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Maksimal 12 MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* TAHAP 2: VIEWPORT KANVAS 9:16 COMPACT */}
              {rawImageSrc && !previewFoto && (
                <div className="w-full space-y-2.5 flex flex-col items-center">
                  {/* BINGKAI KANVAS DIKUNCI 170px X 302px (RASIO 9:16) */}
                  <div
                    ref={cropFrameRef}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    className="relative w-[170px] h-[302px] bg-white border-2 border-amber-500 shadow-md overflow-hidden cursor-grab active:cursor-grabbing rounded-xs flex items-center justify-center touch-none select-none shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={rawImageSrc}
                      alt="Crop Source"
                      draggable={false}
                      style={{
                        width: "100%",
                        maxWidth: "none",
                        height: "auto",
                        transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isDragging
                          ? "none"
                          : "transform 0.05s ease-out",
                      }}
                      className="pointer-events-none select-none"
                    />

                    {/* Grid Pembantu */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                      <div className="border-r border-b border-black/50" />
                      <div className="border-r border-b border-black/50" />
                      <div className="border-b border-black/50" />
                      <div className="border-r border-b border-black/50" />
                      <div className="border-r border-b border-black/50" />
                      <div className="border-b border-black/50" />
                      <div className="border-r border-b border-black/50" />
                      <div className="border-r border-b border-black/50" />
                      <div />
                    </div>

                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/75 px-2 py-0.5 rounded-full text-[8px] text-stone-200 pointer-events-none flex items-center gap-1 whitespace-nowrap">
                      <Move className="w-2.5 h-2.5 text-amber-300" />
                      <span>Geser atas/bawah</span>
                    </div>
                  </div>

                  {/* TOOLBAR ZOOM & ROTASI SATU BARIS */}
                  <div className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded-2xs flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 flex-1">
                      <button
                        type="button"
                        onClick={() => adjustZoom(-0.15)}
                        disabled={zoom <= 1}
                        className="w-6 h-6 rounded-2xs bg-stone-100 hover:bg-stone-200 text-neutral-800 disabled:opacity-30 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        -
                      </button>

                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => {
                          const newZ = parseFloat(e.target.value);
                          setZoom(newZ);
                          setPan((prev) => clampPan(prev.x, prev.y, newZ));
                        }}
                        className="w-full accent-amber-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => adjustZoom(0.15)}
                        disabled={zoom >= 3}
                        className="w-6 h-6 rounded-2xs bg-stone-100 hover:bg-stone-200 text-neutral-800 disabled:opacity-30 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 border-l border-stone-200 pl-1.5">
                      <button
                        type="button"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="w-6 h-6 rounded-2xs bg-stone-100 hover:bg-stone-200 text-neutral-800 flex items-center justify-center cursor-pointer"
                        title="Putar 90°"
                      >
                        <RotateCw className="w-3 h-3 text-amber-800" />
                      </button>

                      <button
                        type="button"
                        onClick={resetTransform}
                        className="w-6 h-6 rounded-2xs bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                        title="Reset"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* TOMBOL AKSI BAWAH */}
                  <div className="w-full flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRawImageSrc(null)}
                      className="py-2 px-2.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 text-[10px] font-bold uppercase rounded-2xs transition cursor-pointer shrink-0"
                    >
                      Ganti
                    </button>

                    <button
                      type="button"
                      onClick={handleCropExecute}
                      className="flex-1 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer rounded-2xs active:scale-[0.99]"
                    >
                      <Crop className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pangkas 9:16</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAHAP 3: HASIL CROP & SIMPAN */}
              {previewFoto && (
                <div className="w-full space-y-2.5 flex flex-col items-center">
                  <div className="relative w-[170px] h-[302px] bg-white border border-stone-300 shadow-md rounded-2xs overflow-hidden shrink-0">
                    <Image
                      src={previewFoto}
                      alt="Hasil 9:16"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <form
                    onSubmit={handleSaveToDatabase}
                    className="w-full space-y-1.5 pt-1"
                  >
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2 bg-neutral-950 hover:bg-amber-950 disabled:bg-stone-400 text-white text-[11px] font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer rounded-2xs active:scale-[0.99]"
                    >
                      {isProcessing && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      )}
                      <span>Upload</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewFoto(null)}
                      className="w-full py-1 text-stone-600 hover:text-neutral-950 text-[10px] font-bold uppercase text-center transition cursor-pointer"
                    >
                      ← Atur Ulang
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM PREVIEW FULL (9:16) */}
      {zoomFoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setZoomFoto(null)} />
          <div className="relative z-10 bg-white p-3 max-w-[280px] w-full space-y-2 shadow-2xl rounded-xs">
            <div className="flex justify-between items-center pb-1.5 border-b border-stone-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-950">
                Detail Testimoni
              </span>
              <button
                onClick={() => setZoomFoto(null)}
                className="p-1 text-stone-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-[9/16] w-full max-h-[65vh] bg-stone-100 overflow-hidden rounded-2xs">
              <Image
                src={zoomFoto}
                alt="Detail Testimoni"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 bg-white p-5 max-w-xs w-full space-y-3 shadow-2xl border border-stone-200 text-center rounded-xs">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Hapus Foto Testimoni?
              </h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Foto testimoni ini akan dihapus permanen dari galeri toko.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-white border border-stone-300 hover:bg-stone-50 text-neutral-800 text-xs font-bold uppercase py-2 transition cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase py-2 transition shadow-xs cursor-pointer rounded-2xs"
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
