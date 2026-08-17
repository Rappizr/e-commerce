"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useKeranjang } from "../penyimpanan/KeranjangContext";


// Dummy database etalase barang (Siap diganti/dihubungkan ke database client)

const dummyProducts = [
  {
    id: "1",
    title: "Daster Arab Renda Rayon Premium",
    category: "DASTER",
    price: "Rp 115.000",
    desc: "Daster Arab Renda elegan berbahan Rayon Premium super adem dan lembut di kulit. Dilengkapi hiasan renda cantik serta potongan busui-friendly yang nyaman dipakai harian.",
    images: {
      main: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "2",
    title: "Daster Midi Floral Rayon Adem",
    category: "DASTER",
    price: "Rp 89.000",
    desc: "Daster midi santai dengan motif floral kekinian. Terbuat dari katun rayon pilihan yang ringan, dingin, dan memberikan keleluasaan bergerak sepanjang hari.",
    images: {
      main: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "3",
    title: "Daster Kaftan Siluet Minimalis",
    category: "DASTER",
    price: "Rp 135.000",
    desc: "Kaftan rumahan bergaya minimalis modern dengan potongan jatuh yang anggun. Sangat nyaman untuk bersantai maupun menyambut tamu di rumah.",
    images: {
      main: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "4",
    title: "Gamis Abaya Silk Polos Elegan",
    category: "GAMIS",
    price: "Rp 275.000",
    desc: "Gamis Abaya polos berbahan Silk Premium dengan efek kilap mewah yang halus. Cocok untuk acara formal, pengajian, maupun pesta perkawinan.",
    images: {
      main: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "5",
    title: "Daster Panjang Twill Busui Friendly",
    category: "DASTER",
    price: "Rp 105.000",
    desc: "Daster lengan panjang berbahan Twill tebal namun dingin. Dilengkapi kancing depan aktif yang aman untuk ibu menyusui.",
    images: {
      main: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "6",
    title: "Setcel Knit Crinkle Kulot",
    category: "SETCEL",
    price: "Rp 189.000",
    desc: "Setelan celana wanita berbahan Knit Crinkle premium anti-kusut. Atasan fleksibel dipadukan dengan celana kulot longgar yang fashionable.",
    images: {
      main: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "7",
    title: "Gamis Tiered Dress Pastel Mewah",
    category: "GAMIS",
    price: "Rp 299.000",
    desc: "Gamis bertingkat (tiered dress) berwarna pastel lembut. Jahitan rapi berkualits tinggi dengan bagian bawah mengembang anggun.",
    images: {
      main: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
  {
    id: "8",
    title: "Setcel Rayon Motif Tie Dye Harian",
    category: "SETCEL",
    price: "Rp 165.000",
    desc: "Setelan baju dan celana motif tie dye kekinian. Terbuat dari serat rayon organik super dingin untuk menemani aktivitas harian Anda.",
    images: {
      main: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  },
];

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  // Temukan barang yang diklik user di etalase, atau gunakan default dummy jika membuka langsung
  const product = dummyProducts.find((p) => p.id === productId) || {
    id: "default",
    title: "Mantel Trench Wol Oversized",
    category: "PAKAIAN LUAR — KOLEKSI 2024",
    price: "Rp 19.500.000",
    desc: "Karya busana esensial untuk lemari pakaian modern. Dibuat dari bahan wol Italia dua sisi berkualitas tinggi, menampilkan struktur bahu yang tegas, sabuk yang elegan, serta jahitan buatan tangan. Dirancang dengan siluet eksklusif dan anggun.",
    images: {
      main: "/main-coat.png",
      detail1: "/detail-1.png",
      detail2: "/detail-2.png",
    },
  };

  const [selectedColor, setSelectedColor] = useState("camel");
  const [selectedSize, setSelectedSize] = useState("M");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const sizes = ["XS", "S", "M", "L"];
  const colors = [
    { id: "camel", name: "COKELAT KARAMEL", bgClass: "bg-[#C49A70]" },
    { id: "black", name: "HITAM", bgClass: "bg-[#181818]" },
    { id: "grey", name: "ABU-ABU OLIVE", bgClass: "bg-[#6D6B63]" },
  ];

  const { tambahKeKeranjang } = useKeranjang();

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleAddToCart = () => {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, "")) || 100000;
    const selectedColorName = colors.find((c) => c.id === selectedColor)?.name || "Default";
    
    tambahKeKeranjang({
      id: product.id,
      title: product.title,
      price: numericPrice,
      size: selectedSize,
      color: selectedColorName,
      image: product.images.main,
    });


    setIsAdded(true);
    setShowToast(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };


  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-14 relative">
      {/* Toast Notification Floating Animation */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-6 py-4 rounded-none shadow-2xl flex items-center gap-4 border border-neutral-700 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Produk Ditambahkan!</p>
            <p className="text-[11px] text-neutral-300 font-light">{product.title} (Ukuran: {selectedSize})</p>
          </div>
          <Link href="/keranjang" className="ml-2 text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider">
            Lihat Keranjang →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

        
        {/* LEFT COLUMN: Media Showcase Gallery */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Main Image */}
          <div className="relative aspect-[3/4] w-full bg-stone-200 overflow-hidden shadow-sm group">
            <Image
              src={product.images.main}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Secondary Grid Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-square w-full bg-stone-200 overflow-hidden shadow-sm group">
              <Image
                src={product.images.detail1}
                alt="Detail Bahan"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="relative aspect-square w-full bg-stone-200 overflow-hidden shadow-sm group">
              <Image
                src={product.images.detail2}
                alt="Tampilan Belakang"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Controls */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-7 pr-0 lg:pr-4">
          
          {/* Header / Title */}
          <div>
            <p className="text-[11px] tracking-[0.25em] text-stone-400 font-medium uppercase mb-2">
              {product.category}
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-normal leading-[1.15] text-stone-900 tracking-tight font-serif-luxury">
              {product.title}
            </h1>

            <p className="text-xl md:text-2xl text-stone-800 mt-3 font-light tracking-wide">
              {product.price}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light">
            {product.desc}
          </p>

          {/* Color Swatches */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-xs tracking-wider uppercase">
              <span className="text-stone-400 font-medium">WARNA:</span>
              <span className="ml-2 font-semibold text-stone-800">
                {colors.find((c) => c.id === selectedColor)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  aria-label={`Pilih warna ${color.name}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedColor === color.id
                      ? "ring-1 ring-offset-2 ring-stone-800 scale-110"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className={`w-full h-full rounded-full ${color.bgClass} border border-black/10`} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-stone-400 font-medium">UKURAN</span>
              <button className="text-[10px] text-stone-400 hover:text-stone-900 underline underline-offset-4 tracking-widest transition">
                PANDUAN UKURAN
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-xs tracking-wider uppercase transition-all duration-200 border ${
                    selectedSize === size
                      ? "border-stone-900 bg-white font-semibold text-stone-900 shadow-sm scale-[1.02]"
                      : "border-stone-200 text-stone-500 hover:border-stone-400 hover:scale-[1.02] bg-stone-50/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons with Micro-Animation Zoom Effect */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleAddToCart}
              className={`w-full text-xs tracking-[0.2em] font-semibold uppercase py-4 rounded-full transition-all duration-300 transform active:scale-[0.97] shadow-md flex items-center justify-center gap-2 ${
                isAdded
                  ? "bg-emerald-700 text-white scale-[1.03] shadow-emerald-900/20"
                  : "bg-[#141414] hover:bg-black text-white hover:scale-[1.03] hover:shadow-xl"
              }`}
            >
              {isAdded ? (
                <>
                  <span className="animate-bounce">✓</span>
                  <span>BERHASIL DITAMBAHKAN!</span>
                </>
              ) : (
                <span>TAMBAH KE KERANJANG</span>
              )}
            </button>

            <button className="w-full bg-white hover:bg-stone-50 text-stone-800 text-xs tracking-[0.18em] font-medium uppercase py-3.5 rounded-full border border-stone-300 flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] hover:shadow-md hover:border-stone-400">

              <svg className="w-4 h-4 text-stone-600 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>KONSULTASI DENGAN STYLIST</span>
            </button>
          </div>

          {/* Accordion Details */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="border-b border-stone-200 pb-3">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full flex items-center justify-between text-left py-1 group"
              >
                <span className="text-xs font-semibold tracking-[0.15em] text-stone-800 uppercase group-hover:text-black">
                  Rincian Produk
                </span>
                <svg
                  className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${
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
                <div className="mt-3 text-xs text-stone-600 space-y-1.5 leading-relaxed pl-1 animate-fadeIn">
                  <p>• Bahan kualitas premium super adem & lembut</p>
                  <p>• Jahitan rapi kelas butik eksklusif</p>
                  <p>• Nyaman dipakai untuk sehari-hari maupun bepergian</p>
                  <p>• Petunjuk perawatan: cuci lembut dengan tangan</p>
                </div>
              )}
            </div>

            <div className="border-b border-stone-200 pb-3">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left py-1 group"
              >
                <span className="text-xs font-semibold tracking-[0.15em] text-stone-800 uppercase group-hover:text-black">
                  Pengiriman & Pengembalian
                </span>
                <svg
                  className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${
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
                <div className="mt-3 text-xs text-stone-600 space-y-1.5 leading-relaxed pl-1 animate-fadeIn">
                  <p>• Pengiriman ekspres ke seluruh wilayah Indonesia (2-4 hari kerja)</p>
                  <p>• Pengembalian gratis dalam waktu 30 hari jika produk cacat/rusak</p>
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
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#C49A70] selection:text-white">
      {/* Header Khusus: Hanya Logo + Nama Brand dan Tombol Kembali */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-neutral-200 shadow-sm">
              <Image
                src="/LOGO.jpeg"
                alt="Almaco Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-widest text-neutral-900 uppercase">
              ALMACO FASHION
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors border border-neutral-300 px-4 py-2 hover:border-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="p-12 text-center text-stone-500">Memuat detail produk...</div>}>
        <ProductDetailContent />
      </Suspense>
    </div>
  );
}



