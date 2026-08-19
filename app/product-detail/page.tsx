"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, ShoppingBag } from "lucide-react";
import { useKeranjang } from "../penyimpanan/KeranjangContext";
import Footer from "../Footer";

// Dummy database etalase barang
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

  const product = dummyProducts.find((p) => p.id === productId) || dummyProducts[0];

  const [selectedColor, setSelectedColor] = useState("camel");
  const [selectedSize, setSelectedSize] = useState("M");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);

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

    setShowCenterModal(true);
  };

  return (
    <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-14 relative">
      
      {/* Pop-up Dialog Sukses Tambah Keranjang */}
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
              aria-label="Tutup Dialog"
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
                  src={product.images.main}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                  Ukuran: <strong className="text-neutral-800">{selectedSize}</strong> | Warna: <strong className="text-neutral-800">{colors.find((c) => c.id === selectedColor)?.name}</strong>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

        {/* Gallery Foto Produk */}
        <div className="lg:col-span-7 space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-square w-full bg-stone-200 overflow-hidden shadow-sm group">
              <Image
                src={product.images.main}
                alt="Detail Produk 1"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="relative aspect-square w-full bg-stone-200 overflow-hidden shadow-sm group">
              <Image
                src={product.images.main}
                alt="Detail Produk 2"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Informasi & Pilihan Ukuran Produk */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-7 pr-0 lg:pr-4">
          
          <div>
            <p className="text-[11px] tracking-[0.25em] text-neutral-400 font-bold uppercase mb-2">
              {product.category}
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 tracking-tight">
              {product.title}
            </h1>

            <p className="text-xl md:text-2xl text-neutral-900 mt-3 font-semibold tracking-wide">
              {product.price}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {product.desc}
          </p>

          {/* Pemilihan Warna */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-xs tracking-wider uppercase">
              <span className="text-neutral-400 font-bold">WARNA:</span>
              <span className="ml-2 font-semibold text-neutral-800">
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
                      ? "ring-1 ring-offset-2 ring-neutral-900 scale-110"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className={`w-full h-full rounded-full ${color.bgClass} border border-black/10`} />
                </button>
              ))}
            </div>
          </div>

          {/* Pemilihan Ukuran */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-neutral-400 font-bold">UKURAN</span>
              <button className="text-[10px] text-neutral-500 hover:text-neutral-950 underline underline-offset-4 tracking-widest transition">
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
                      ? "border-neutral-950 bg-white font-bold text-neutral-950 shadow-xs scale-[1.02]"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:scale-[1.02] bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full text-xs tracking-[0.2em] font-semibold uppercase py-4 transition-all duration-300 transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-950 text-white"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>TAMBAH KE KERANJANG</span>
            </button>
          </div>

          {/* Akordion Detail Produk */}
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
                  <p>• Bahan kualitas premium super adem & lembut</p>
                  <p>• Jahitan rapi kelas butik eksklusif</p>
                  <p>• Nyaman dipakai untuk sehari-hari maupun bepergian</p>
                  <p>• Petunjuk perawatan: cuci lembut dengan tangan</p>
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
      
      {/* Header Full-Width Rata Tepi seperti Beranda */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Rata Kiri */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-xl sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide block mt-1">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          {/* Tombol Kembali Rata Kanan */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
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