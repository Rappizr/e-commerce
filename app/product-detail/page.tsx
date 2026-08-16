"use client";

import React, { useState } from "react";
import Image from "next/image";

import Navbar from "../Navbar";

export default function ProductDetailPage() {
  // State management
  const [selectedColor, setSelectedColor] = useState("camel");
  const [selectedSize, setSelectedSize] = useState("M");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Available options
  const sizes = ["XS", "S", "M", "L"];
  const colors = [
    { id: "camel", name: "COKELAT KARAMEL", bgClass: "bg-[#C49A70]" },
    { id: "black", name: "HITAM", bgClass: "bg-[#181818]" },
    { id: "grey", name: "ABU-ABU OLIVE", bgClass: "bg-[#6D6B63]" },
  ];

  // Image paths
  const images = {
    main: "/main-coat.png",
    detail1: "/detail-1.png",
    detail2: "/detail-2.png",
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#E6E3DA] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#C49A70] selection:text-white">
      <Navbar />

      {/* Product Detail Main Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-14">


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Media Showcase Gallery */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Main Image */}
            <div className="relative aspect-[3/4] w-full bg-stone-200 overflow-hidden shadow-sm group">
              <Image
                src={images.main}
                alt="Mantel Trench Wol Oversized"
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
                  src={images.detail1}
                  alt="Detail Bahan Wol"
                  fill
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="relative aspect-square w-full bg-stone-200 overflow-hidden shadow-sm group">
                <Image
                  src={images.detail2}
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
                PAKAIAN LUAR — KOLEKSI 2024
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-normal leading-[1.15] text-stone-900 tracking-tight font-serif-luxury">
                Mantel Trench Wol<br />Oversized
              </h1>

              <p className="text-xl md:text-2xl text-stone-800 mt-3 font-light tracking-wide">
                Rp 19.500.000
              </p>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light">
              Karya busana esensial untuk lemari pakaian modern. Dibuat dari bahan wol Italia dua sisi berkualitas tinggi, menampilkan struktur bahu yang tegas, sabuk yang elegan, serta jahitan buatan tangan. Dirancang dengan siluet eksklusif dan anggun.
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
                    className={`py-3 text-xs tracking-wider uppercase transition-all duration-300 border ${
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
              {/* Add to Cart Button */}
              <button className="w-full bg-[#141414] hover:bg-black text-white text-xs tracking-[0.2em] font-semibold uppercase py-4 rounded-full transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl shadow-md">
                TAMBAH KE KERANJANG
              </button>

              {/* Consult Stylist Button */}
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
                    <p>• 100% Wol Italia Premium Ganda (*Double-Faced*)</p>
                    <p>• Kerah lebar dengan kancing efek tanduk</p>
                    <p>• Sabuk pinggang yang dapat dilepas dengan gesper</p>
                    <p>• Perawatan: *Dry Clean* saja</p>
                    <p>• Diproduksi di Italia</p>
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
                    <p>• Gratis pengiriman ekspres ke seluruh Indonesia (2-4 hari kerja)</p>
                    <p>• Pengembalian gratis dalam waktu 30 hari setelah pembelian</p>
                    <p>• Pajak dan biaya pengiriman sudah termasuk di kasir</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
