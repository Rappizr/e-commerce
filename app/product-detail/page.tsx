"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, ShoppingBag, ChevronLeft, ChevronRight, Images, ZoomIn } from "lucide-react";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import Footer from "../Footer";

const colorMap: Record<string, string> = {
  hitam: "#181818",
  black: "#181818",
  putih: "#FFFFFF",
  white: "#FFFFFF",
  "cokelat karamel": "#C49A70",
  cokelat: "#8B5A2B",
  caramel: "#C49A70",
  mocca: "#9E7B66",
  moka: "#9E7B66",
  cream: "#EED9C4",
  krem: "#EED9C4",
  "sage green": "#8A9A86",
  sage: "#8A9A86",
  hijau: "#3A5A40",
  "hijau botol": "#1B4332",
  navy: "#1B263B",
  biru: "#2B4C7E",
  maroon: "#5E1914",
  merah: "#9E2A2B",
  "dusty pink": "#D8A48F",
  pink: "#E8A598",
  "abu misty": "#D1D5DB",
  "abu-abu": "#6D6B63",
  abu: "#6D6B63",
  grey: "#6D6B63",
  lilac: "#B8A9C9",
  ungu: "#6A4C93",
  terracotta: "#C86446",
  mustard: "#D4A373",
  denim: "#4A6B82",
  khaki: "#BDB76B",
  army: "#4B5320",
  olive: "#556B2F",
};

const getColorHex = (name: string): string | null => {
  const normalized = name.toLowerCase().trim();
  if (colorMap[normalized]) return colorMap[normalized];
  for (const key in colorMap) {
    if (normalized.includes(key)) return colorMap[key];
  }
  return null;
};

const dummyProducts = [
  {
    id: "1",
    title: "Daster Arab Renda Rayon Premium",
    category: "DASTER",
    price: "Rp 115.000",
    stok: 24,
    desc: "Daster Arab Renda elegan berbahan Rayon Premium super adem dan lembut di kulit. Dilengkapi hiasan renda cantik serta potongan busui-friendly yang nyaman dipakai harian.",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    ],
    warna: ["Cokelat Karamel", "Hitam", "Abu Misty", "Sage Green"],
    ukuran: ["XS", "S", "M", "L", "XL"],
    details: [
      "Bahan kualitas premium super adem & lembut",
      "Jahitan rapi kelas butik eksklusif",
      "Nyaman dipakai untuk sehari-hari maupun bepergian",
      "Petunjuk perawatan: cuci lembut dengan tangan",
    ],
  },
  {
    id: "2",
    title: "Daster Midi Floral Rayon Adem",
    category: "DASTER",
    price: "Rp 89.000",
    stok: 12,
    desc: "Daster midi santai dengan motif floral kekinian. Terbuat dari katun rayon pilihan yang ringan, dingin, dan memberikan keleluasaan bergerak sepanjang hari.",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop",
    ],
    warna: ["Cokelat Karamel", "Hitam", "Mocca"],
    ukuran: ["XS", "S", "M", "L"],
    details: [
      "Bahan kualitas premium super adem & lembut",
      "Jahitan rapi kelas butik eksklusif",
      "Nyaman dipakai untuk sehari-hari maupun bepergian",
      "Petunjuk perawatan: cuci lembut dengan tangan",
    ],
  },
];

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const product = dummyProducts.find((p) => p.id === productId) || dummyProducts[0];
  const allImages = Array.isArray(product.images) ? product.images : [(product as any).images?.main || ""];
  const sisaStok = typeof product.stok === 'number' ? product.stok : 15;

  const rawWarnaList: string[] = (product as any).warna 
    ? (product as any).warna 
    : (product as any).colors?.map((c: any) => c.name || c) || ["Default"];

  const [selectedColor, setSelectedColor] = useState(rawWarnaList[0] || "Default");
  const [selectedSize, setSelectedSize] = useState((product as any).ukuran?.[0] || (product as any).sizes?.[0] || "M");
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [showCenterModal, setShowCenterModal] = useState(false);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { tambahKeKeranjang } = useKeranjang();

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

  const handleAddToCart = () => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, "")) || 100000;
    
    tambahKeKeranjang({
      id: product.id,
      title: product.title,
      price: numericPrice,
      size: selectedSize,
      color: selectedColor,
      image: allImages[0],
    });

    setShowCenterModal(true);
  };

  const remainingPhotosCount = allImages.length > 3 ? allImages.length - 3 : 0;

  return (
    <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-14 relative">
      
      {showCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowCenterModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCenterModal(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <Check className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                  Produk Ditambahkan!
                </h3>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">
                  Berhasil masuk ke keranjang belanja Anda
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center bg-neutral-50 p-3.5 border border-neutral-200/80">
              <div className="relative w-16 h-20 bg-neutral-200 shrink-0 overflow-hidden border border-neutral-200">
                <Image
                  src={allImages[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                  {product.title}
                </h4>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider truncate">
                  Ukuran: <strong className="text-neutral-800">{selectedSize}</strong> | Warna: <strong className="text-neutral-800">{selectedColor}</strong>
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  {product.price}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCenterModal(false)}
                className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 transition-colors text-center"
              >
                Lanjut Belanja
              </button>

              <Link
                href="/keranjang"
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Lihat Keranjang</span>
              </Link>
            </div>
          </div>
        </div>
      )}

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
              className="p-1.5 text-neutral-400 hover:text-white transition rounded-full hover:bg-neutral-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center py-4">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-6 z-10 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-2xl h-[60vh] sm:h-[70vh]">
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
              className="absolute right-2 sm:right-6 z-10 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-14 h-16 sm:w-16 sm:h-20 shrink-0 border-2 transition overflow-hidden ${
                  activeImageIndex === idx ? "border-white scale-105" : "border-neutral-700 opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

        <div className="lg:col-span-7 space-y-4">
          <div 
            onClick={() => openLightbox(0)}
            className="relative aspect-[3/4] w-full bg-stone-200 overflow-hidden shadow-sm group cursor-pointer"
          >
            <Image
              src={allImages[0] || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop"}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => openLightbox(1)}
                className="relative aspect-[3/4] w-full bg-stone-200 overflow-hidden shadow-sm group cursor-pointer"
              >
                <Image
                  src={allImages[1]}
                  alt="Detail Produk 1"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>

              {allImages[2] && (
                <div 
                  onClick={() => openLightbox(2)}
                  className="relative aspect-[3/4] w-full bg-stone-200 overflow-hidden shadow-sm group cursor-pointer"
                >
                  <Image
                    src={allImages[2]}
                    alt="Detail Produk 2"
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {remainingPhotosCount > 0 ? (
                    <div className="absolute inset-0 bg-black/60 hover:bg-black/70 transition flex flex-col items-center justify-center text-white p-3 text-center space-y-1.5 backdrop-blur-[2px]">
                      <Images className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                        +{remainingPhotosCount} Foto Lainnya
                      </span>
                      <span className="text-[10px] text-neutral-300 tracking-wider">
                        Klik untuk melihat galeri
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {allImages.length > 3 && (
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-widest py-3 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Images className="w-4 h-4" />
              <span>Buka Semua Galeri Foto ({allImages.length} Foto)</span>
            </button>
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 pr-0 lg:pr-4">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400">
              <span>{product.category}</span>
              <span className="text-neutral-300">•</span>
              <span className={sisaStok > 0 ? "text-neutral-600" : "text-rose-600 font-bold"}>
                {sisaStok > 0 ? `SISA STOK: ${sisaStok} PCS` : "STOK HABIS"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl text-neutral-950 font-semibold tracking-wide">
                {product.price}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {product.desc}
          </p>

          {/* Pemilihan Warna Otomatis Berdasarkan Teks dari Admin */}
          {rawWarnaList && rawWarnaList.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center text-xs tracking-wider uppercase">
                <span className="text-neutral-400 font-bold">WARNA:</span>
                <span className="ml-2 font-bold text-neutral-900">
                  {selectedColor}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {rawWarnaList.map((warnaName) => {
                  const hexCode = getColorHex(warnaName);
                  const isSelected = selectedColor.toLowerCase() === warnaName.toLowerCase();

                  if (hexCode) {
                    return (
                      <button
                        key={warnaName}
                        type="button"
                        onClick={() => setSelectedColor(warnaName)}
                        title={warnaName}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-neutral-950 scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span 
                          style={{ backgroundColor: hexCode }}
                          className={`w-full h-full rounded-full border ${
                            hexCode.toLowerCase() === "#ffffff" ? "border-neutral-300" : "border-black/10"
                          }`} 
                        />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={warnaName}
                      type="button"
                      onClick={() => setSelectedColor(warnaName)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase transition border ${
                        isSelected
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                          : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500"
                      }`}
                    >
                      {warnaName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pemilihan Ukuran */}
          {((product as any).ukuran || (product as any).sizes) && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase">
                <span className="text-neutral-400 font-bold">UKURAN</span>
                <button className="text-[10px] text-neutral-500 hover:text-neutral-900 underline underline-offset-4 tracking-widest transition">
                  PANDUAN UKURAN
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {((product as any).ukuran || (product as any).sizes).map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs tracking-wider uppercase transition-all duration-200 border ${
                      selectedSize === size
                        ? "border-neutral-950 bg-white font-bold text-neutral-950 shadow-xs scale-[1.02]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:scale-[1.02] bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-3">
            <button
              onClick={handleAddToCart}
              disabled={sisaStok <= 0}
              className={`w-full text-xs tracking-[0.2em] font-semibold uppercase py-4 transition-all duration-300 transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${
                sisaStok > 0
                  ? "bg-neutral-900 hover:bg-neutral-950 text-white cursor-pointer"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{sisaStok > 0 ? "TAMBAH KE KERANJANG" : "STOK HABIS"}</span>
            </button>
          </div>

          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <div className="border-b border-neutral-200 pb-3">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full flex items-center justify-between text-left py-1 group"
              >
                <span className="text-xs font-semibold tracking-[0.15em] text-neutral-800 uppercase group-hover:text-black">
                  Rincian Produk
                </span>
                <svg
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${
                    openAccordion === "details" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openAccordion === "details" && (
                <div className="mt-3 text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1 animate-fadeIn">
                  {product.details?.map((detail, idx) => (
                    <p key={idx}>• {detail}</p>
                  )) || (
                    <>
                      <p>• Bahan kualitas premium super adem & lembut</p>
                      <p>• Jahitan rapi kelas butik eksklusif</p>
                      <p>• Nyaman dipakai untuk sehari-hari maupun bepergian</p>
                      <p>• Petunjuk perawatan: cuci lembut dengan tangan</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="border-b border-neutral-200 pb-3">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left py-1 group"
              >
                <span className="text-xs font-semibold tracking-[0.15em] text-neutral-800 uppercase group-hover:text-black">
                  Pengiriman & Garansi Retur
                </span>
                <svg
                  className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${
                    openAccordion === "shipping" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openAccordion === "shipping" && (
                <div className="mt-3 text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1 animate-fadeIn">
                  <p>• Pengiriman langsung dari Dusun Jai, Mergayu, Bandung, Tulungagung</p>
                  <p>• Pengiriman ekspres via JNE, J&T, dan SiCepat (1-4 hari kerja)</p>
                  <p>• Garansi ganti barang 100% jika produk cacat produksi</p>
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
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-lg sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="p-12 text-center text-neutral-500">Memuat detail produk...</div>}>
        <ProductDetailContent />
      </Suspense>

      <Footer />
    </div>
  );
}