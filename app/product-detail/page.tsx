"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  X, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  ZoomIn, 
  Loader2, 
  Plus, 
  Minus,
  CheckCircle2,
  Tag
} from "lucide-react";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import Footer from "../Footer";
import { supabase } from "../penyimpanan/supabase";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Default");
  const [selectedSize, setSelectedSize] = useState("All Size");
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { tambahKeKeranjang } = useKeranjang();

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    const fetchSingleProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, nama, kategori, harga, stok, berat, deskripsi, is_grosir, min_grosir, harga_grosir, gambar_list, gambar_utama, warna, ukuran, rincian")
          .eq("id", productId)
          .single();

        if (data && !error) {
          const imgList = Array.isArray(data.gambar_list) && data.gambar_list.length > 0 
            ? data.gambar_list 
            : [data.gambar_utama || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop"];

          const warnaArr = Array.isArray(data.warna) && data.warna.length > 0 ? data.warna : ["Default"];
          const ukuranArr = Array.isArray(data.ukuran) && data.ukuran.length > 0 ? data.ukuran : ["All Size"];
          const detailsArr = Array.isArray(data.rincian) && data.rincian.length > 0 
            ? data.rincian 
            : ["Bahan premium super adem & lembut", "Jahitan rapi kelas butik"];

          const mapped = {
            id: String(data.id),
            title: data.nama || "Busana Almaco",
            category: data.kategori || "Busana",
            price: `Rp ${Number(data.harga || 0).toLocaleString("id-ID")}`,
            rawPrice: Number(data.harga || 0),
            stok: typeof data.stok === "number" ? data.stok : 0,
            weight: Number(data.berat || 350),
            desc: data.deskripsi || "Busana modis berkualitas premium dari ALMACO FASHION.",
            is_grosir: Boolean(data.is_grosir),
            min_grosir: data.min_grosir ? Number(data.min_grosir) : null,
            harga_grosir: data.harga_grosir ? Number(data.harga_grosir) : null,
            images: imgList,
            warna: warnaArr,
            ukuran: ukuranArr,
            details: detailsArr,
          };

          setProduct(mapped);
          setSelectedColor(warnaArr[0]);
          setSelectedSize(ukuranArr[0]);

          if (mapped.is_grosir && mapped.min_grosir) {
            setQuantity(mapped.min_grosir);
          } else {
            setQuantity(1);
          }
        }
      } catch (e) {
        console.error("Fetch Supabase Product Error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        <p className="text-xs uppercase tracking-widest font-bold text-neutral-500">Memuat Detail Produk...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <div className="bg-white border border-neutral-200 p-10 max-w-md mx-auto shadow-xs space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-neutral-300" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Produk Tidak Ditemukan</h2>
          <p className="text-[11px] text-neutral-500">Produk ini mungkin telah dihapus atau belum diunggah dari Panel Admin.</p>
          <Link href="/" className="inline-block bg-neutral-950 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 mt-2 hover:bg-black transition">
            Kembali Ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const allImages = product.images;
  const sisaStok = product.stok;
  const rawWarnaList: string[] = product.warna;

  const isQualifiedGrosir = Boolean(
    product.is_grosir && 
    product.min_grosir && 
    product.harga_grosir && 
    quantity >= product.min_grosir
  );

  const activeUnitPrice = isQualifiedGrosir ? product.harga_grosir : product.rawPrice;
  const subtotalPrice = activeUnitPrice * quantity;
  const savingPerPcs = product.is_grosir && product.harga_grosir ? (product.rawPrice - product.harga_grosir) : 0;

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setGalleryModalOpen(true);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // PERBAIKAN PENTING DI SINI
  const handleAddToCart = () => {
    if (quantity <= 0 || sisaStok <= 0) return;

    tambahKeKeranjang(
      {
        id: product.id,
        title: product.title,
        price: activeUnitPrice,
        rawPrice: product.rawPrice,         // PERBAIKAN: Mengirim harga eceran asli
        is_grosir: product.is_grosir,       // PERBAIKAN: Status grosir
        min_grosir: product.min_grosir,     // PERBAIKAN: Syarat minimal grosir
        harga_grosir: product.harga_grosir, // PERBAIKAN: Nilai harga grosir
        size: selectedSize,
        color: selectedColor,
        weight: product.weight,
        image: allImages[0],
      },
      quantity
    );

    setShowCenterModal(true);
  };

  const extraImagesCount = allImages.length > 3 ? allImages.length - 2 : 0;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative">
      {/* MODAL BERHASIL MASUK KERANJANG */}
      {showCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowCenterModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCenterModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Produk Ditambahkan!
                </h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  {quantity} Pcs Berhasil Masuk Ke Keranjang
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center bg-neutral-50 p-2.5 border border-neutral-200/80">
              <div className="relative w-14 h-18 bg-neutral-200 shrink-0 overflow-hidden border border-neutral-200">
                <Image
                  src={allImages[selectedImageIndex] || allImages[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-900 truncate">
                  {product.title}
                </h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                  Ukuran: <strong className="text-neutral-800">{selectedSize}</strong> | Warna: <strong className="text-neutral-800">{selectedColor}</strong>
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  {quantity} pcs × Rp {activeUnitPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] font-black text-neutral-950 font-mono">
                  Subtotal: Rp {subtotalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/"
                onClick={() => setShowCenterModal(false)}
                className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors text-center block"
              >
                Lanjut Belanja
              </Link>

              <Link
                href="/keranjang"
                onClick={() => setShowCenterModal(false)}
                className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors text-center flex items-center justify-center gap-1 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Keranjang</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX POPUP DAFTAR FOTO UTUH */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Galeri Foto ({activeImageIndex + 1} / {allImages.length})
              </span>
            </div>
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition rounded-full hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center py-4">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-6 z-10 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-md h-[60vh]">
              <Image
                src={allImages[activeImageIndex]}
                alt={`Tampilan foto ${activeImageIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-6 z-10 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {allImages.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-12 h-16 sm:w-14 sm:h-18 shrink-0 border transition overflow-hidden cursor-pointer ${
                  activeImageIndex === idx ? "border-white scale-105 ring-1 ring-white" : "border-neutral-700 opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KONTEN DETAIL UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* GALERI FOTO KIRI */}
        <div className="md:col-span-6 max-w-[440px] mx-auto w-full space-y-2.5">
          <div 
            onClick={() => openLightbox(selectedImageIndex)}
            className="relative w-full aspect-[3/4] max-h-[500px] bg-neutral-100 border border-neutral-200 overflow-hidden group cursor-pointer"
          >
            <Image
              src={allImages[selectedImageIndex] || allImages[0]}
              alt={product.title}
              fill
              priority
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            
            <div className="absolute top-2.5 left-2.5 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-900 border border-neutral-200 shadow-2xs">
              {product.category}
            </div>

            {product.is_grosir && (
              <div className="absolute top-2.5 right-2.5 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>GROSIR MIN. {product.min_grosir} PCS</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-neutral-950/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Perbesar Foto</span>
              </div>
            </div>
          </div>

          {/* LIST THUMBNAIL BAWAH (3 KOTAK SAJA) */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {allImages.slice(0, 3).map((img: string, idx: number) => {
                const isThirdAndHasMore = idx === 2 && extraImagesCount > 0;
                const isSelected = selectedImageIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isThirdAndHasMore) {
                        openLightbox(2);
                      } else {
                        setSelectedImageIndex(idx);
                      }
                    }}
                    className={`relative aspect-[3/4] bg-neutral-100 border cursor-pointer overflow-hidden transition ${
                      isSelected && !isThirdAndHasMore
                        ? "border-neutral-950 ring-1 ring-neutral-950" 
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <Image src={img} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                    
                    {isThirdAndHasMore && (
                      <div className="absolute inset-0 bg-neutral-950/80 hover:bg-neutral-950/90 transition flex flex-col items-center justify-center text-white p-1 text-center">
                        <Images className="w-4 h-4 mb-1 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                          +{extraImagesCount} Foto
                        </span>
                        <span className="text-[8.5px] font-semibold tracking-tight text-neutral-300">
                          Lihat Lainnya
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INFORMASI PRODUK KANAN */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-1 border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-2 text-[10px] tracking-widest font-bold uppercase text-neutral-400">
              <span>{product.category}</span>
              <span className="text-neutral-300">•</span>
              <span className={sisaStok > 0 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                {sisaStok > 0 ? `STOK: ${sisaStok} PCS` : "STOK HABIS"}
              </span>
              <span className="text-neutral-300">•</span>
              <span>{product.weight} GRAM</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif text-neutral-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl text-neutral-950 font-black tracking-tight font-mono">
                Rp {activeUnitPrice.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-neutral-500 font-medium">/ pcs</span>

              {isQualifiedGrosir && (
                <span className="ml-2 text-xs text-neutral-400 line-through font-mono">
                  Rp {product.rawPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>

          {/* DUAL-CARD PRICING TIER (ECER VS GROSIR) */}
          {product.is_grosir && product.harga_grosir && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <span>Pilih Tipe Pembelian</span>
                {savingPerPcs > 0 && (
                  <span className="text-emerald-800 font-mono font-bold">
                    Hemat Rp {savingPerPcs.toLocaleString("id-ID")} / pcs di Paket Grosir
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* KARTU ECER */}
                <div
                  onClick={() => setQuantity(1)}
                  className={`relative p-3 border transition cursor-pointer flex flex-col justify-between ${
                    quantity < (product.min_grosir || 3)
                      ? "border-neutral-950 bg-white ring-1 ring-neutral-950 shadow-xs"
                      : "border-neutral-200 bg-neutral-50/70 hover:border-neutral-300 hover:bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                        Ecer / Satuan
                      </span>
                      {quantity < (product.min_grosir || 3) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold font-mono text-neutral-900">
                      Rp {product.rawPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-medium mt-2 block">
                    Beli 1 - {(product.min_grosir || 3) - 1} pcs
                  </span>
                </div>

                {/* KARTU GROSIR */}
                <div
                  onClick={() => setQuantity(product.min_grosir || 3)}
                  className={`relative p-3 border transition cursor-pointer flex flex-col justify-between ${
                    quantity >= (product.min_grosir || 3)
                      ? "border-emerald-800 bg-emerald-50/20 ring-1 ring-emerald-800 shadow-xs"
                      : "border-neutral-200 bg-neutral-50/70 hover:border-neutral-300 hover:bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                        <span>Seri Grosir</span>
                      </span>
                      {quantity >= (product.min_grosir || 3) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold font-mono text-emerald-950">
                      Rp {product.harga_grosir.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[9px] font-medium">
                    <span className="text-neutral-500 font-mono">Min. {product.min_grosir} pcs</span>
                    <span className="text-emerald-800 font-bold font-mono bg-emerald-100/80 border border-emerald-300 px-1 py-0.2 rounded-2xs">
                      LEBIH MURAH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-600 leading-relaxed">
            {product.desc}
          </p>

          {/* WARNA */}
          {rawWarnaList && rawWarnaList.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center text-xs uppercase">
                <span className="text-neutral-400 font-bold tracking-wider">WARNA:</span>
                <span className="ml-2 font-bold text-neutral-900">{selectedColor}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {rawWarnaList.map((warnaName) => {
                  const isSelected = selectedColor.toLowerCase() === warnaName.toLowerCase();

                  return (
                    <button
                      key={warnaName}
                      type="button"
                      onClick={() => setSelectedColor(warnaName)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                        isSelected
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs"
                          : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {warnaName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* UKURAN */}
          {product.ukuran && product.ukuran.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase">
                <span className="text-neutral-400 font-bold">UKURAN</span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-widest">
                  PILIH SALAH SATU
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.ukuran.map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase transition border cursor-pointer ${
                      selectedSize === size
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-2xs"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KONTROL JUMLAH */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Jumlah Pembelian
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition active:scale-95 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={sisaStok}
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(sisaStok, Number(e.target.value) || 1));
                    setQuantity(val);
                  }}
                  className="w-12 h-9 text-center text-xs font-bold font-mono text-neutral-900 focus:outline-none border-x border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(sisaStok, prev + 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-neutral-500">
                Total: <strong className="text-neutral-950 font-mono text-xs font-bold">Rp {subtotalPrice.toLocaleString("id-ID")}</strong>
              </div>
            </div>
          </div>

          {/* TOMBOL ADD TO CART */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={sisaStok <= 0}
              className={`w-full text-xs tracking-[0.15em] font-bold uppercase py-3.5 transition active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 ${
                sisaStok > 0
                  ? "bg-neutral-900 hover:bg-black text-white cursor-pointer"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {sisaStok > 0 
                  ? `+ KERANJANG (${quantity} PCS • RP ${subtotalPrice.toLocaleString("id-ID")})` 
                  : "STOK HABIS"}
              </span>
            </button>
          </div>

          {/* ACCORDION INFORMATION */}
          <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs">
            <div className="border-b border-neutral-100 pb-2">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full flex items-center justify-between text-left py-1 group font-bold uppercase tracking-wider text-neutral-800 cursor-pointer"
              >
                <span>Rincian Produk & Bahan</span>
                <span className="text-sm">{openAccordion === "details" ? "−" : "+"}</span>
              </button>
              {openAccordion === "details" && (
                <div className="mt-2 text-neutral-600 space-y-1 pl-1 leading-relaxed">
                  {product.details?.map((detail: string, idx: number) => (
                    <p key={idx}>• {detail}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-neutral-100 pb-2">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left py-1 group font-bold uppercase tracking-wider text-neutral-800 cursor-pointer"
              >
                <span>Pengiriman & Garansi</span>
                <span className="text-sm">{openAccordion === "shipping" ? "−" : "+"}</span>
              </button>
              {openAccordion === "shipping" && (
                <div className="mt-2 text-neutral-600 space-y-1 pl-1 leading-relaxed">
                  <p>• Pengiriman langsung dari Dusun Jati, Mergayu, Bandung, Tulungagung</p>
                  <p>• Ekspedisi reguler: JNE, POS, TIKI, J&T</p>
                  <p>• Ekspedisi kargo (&ge;10 kg): JNE JTR, SiCepat GOKIL, J&T Cargo</p>
                  <p>• Garansi ganti baru 100% jika terdapat cacat produksi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={
        <div className="p-12 text-center text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat detail produk...</span>
        </div>
      }>
        <ProductDetailContent />
      </Suspense>

      <Footer />
    </div>
  );
}