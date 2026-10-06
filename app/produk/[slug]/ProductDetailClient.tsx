"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Tag,
  Palette,
  Package,
  Scale,
  Share2,
} from "lucide-react";
import { useKeranjang } from "../../penyimpanan/KeranjangContext";
import Footer from "../../Footer";
import type { ProductMapped, VariantItem } from "../../lib/product-mapper";
import {productPath} from "../../lib/product-slug";

interface ProductDetailClientProps {
  initialProduct: ProductMapped;
  initialVariants: VariantItem[];
}

export default function ProductDetailClient({
  initialProduct,
  initialVariants,
}: ProductDetailClientProps) {
  const product = initialProduct;
  const variants = initialVariants;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(() => {
    if (initialProduct.is_grosir) return "Seri Mix (Campur Warna)";
    const firstInStock =
      initialProduct.warna.find((w) => {
        const matched = initialVariants.find(
          (v) => v.warna.toUpperCase() === w.trim().toUpperCase(),
        );
        return matched ? matched.stok > 0 : true;
      }) || initialProduct.warna[0] || "Default";
    return firstInStock;
  });
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(() =>
    initialProduct.is_grosir ? initialProduct.min_grosir : 1,
  );
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const { tambahKeKeranjang } = useKeranjang();

  const getStockForColor = (colorName: string): number => {
    if (!variants || variants.length === 0) return product.stok || 0;
    const target = colorName.trim().toUpperCase();
    const match = variants.find((v) => v.warna.trim().toUpperCase() === target);
    return match ? Number(match.stok || 0) : 0;
  };

  const isGrosir = Boolean(product.is_grosir);
  const minGrosir = Number(product.min_grosir || 5);
  const activeColorStock = getStockForColor(selectedColor);
  const totalStokSemua = product.stok || 0;
  const currentAvailableStock = isGrosir ? totalStokSemua : activeColorStock;

  const stepQty = isGrosir ? minGrosir : 1;
  const minAllowedQty = isGrosir ? minGrosir : 1;

  useEffect(() => {
    if (currentAvailableStock > 0) {
      if (quantity > currentAvailableStock) {
        if (isGrosir) {
          const maxMultiples =
            Math.floor(currentAvailableStock / minGrosir) * minGrosir;
          setQuantity(Math.max(minGrosir, maxMultiples));
        } else {
          setQuantity(currentAvailableStock);
        }
      } else if (quantity < minAllowedQty) {
        setQuantity(minAllowedQty);
      }
    }
  }, [
    selectedColor,
    currentAvailableStock,
    quantity,
    minAllowedQty,
    isGrosir,
    minGrosir,
  ]);

  const allImages = product.images;
  const rawWarnaList: string[] = product.warna;
  const activeUnitPrice = product.rawPrice;
  const subtotalPrice = activeUnitPrice * quantity;

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
    setActiveImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  const handleAddToCart = () => {
    if (quantity <= 0 || currentAvailableStock <= 0) return;

    const finalColorName = isGrosir ? "Seri Mix (Campur Warna)" : selectedColor;

    tambahKeKeranjang(
      {
        id: product.id,
        title: product.title,
        price: activeUnitPrice,
        rawPrice: product.rawPrice,
        is_grosir: isGrosir,
        min_grosir: isGrosir ? minGrosir : null,
        harga_grosir: isGrosir ? activeUnitPrice : null,
        size: product.ukuran,
        color: finalColorName,
        weight: product.weight,
        image: allImages[0],
      },
      quantity,
    );

    setShowCenterModal(true);
  };

  const handleShareLink = async () => {
    const url = window.location.origin + productPath(product.id, product.title);
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareLinkCopied(true);
        window.setTimeout(() => setShareLinkCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setShareLinkCopied(true);
        window.setTimeout(() => setShareLinkCopied(false), 2000);
      } catch {
        // Clipboard access may be unavailable in insecure contexts.
      }
    }
  };

  const extraImagesCount = allImages.length > 3 ? allImages.length - 2 : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white justify-between">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
          >
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
                <span className="font-black tracking-wider">ALMACO</span>
                <span className="font-light text-amber-800 ml-1">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-stone-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative">
      {/* MODAL NOTIFIKASI SUKSES TAMBAH KERANJANG */}
      {showCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowCenterModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <button
              onClick={() => setShowCenterModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
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

            <div className="flex gap-3 items-center bg-[#FAF8F5] p-2.5 border border-stone-200 rounded-2xs">
              <div className="relative w-14 h-18 bg-neutral-200 shrink-0 overflow-hidden border border-stone-200 rounded-2xs">
                <Image
                  src={allImages[selectedImageIndex] || allImages[0]}
                  alt={product.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-2xs ${
                      isGrosir
                        ? "bg-amber-900 text-amber-100"
                        : "bg-neutral-900 text-white"
                    }`}
                  >
                    {isGrosir ? "GROSIR SERI" : "ECERAN"}
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-900 truncate">
                    {product.title}
                  </h4>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                  Ukuran:{" "}
                  <strong className="text-neutral-800">{product.ukuran}</strong>
                </p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                  Warna:{" "}
                  <strong className="text-neutral-800">
                    {isGrosir ? "Seri Mix (Campur Warna)" : selectedColor}
                  </strong>
                </p>
                <p className="text-xs font-bold text-neutral-900">
                  {quantity} pcs × Rp {activeUnitPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] font-black text-amber-950 font-mono">
                  Subtotal: Rp {subtotalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/"
                onClick={() => setShowCenterModal(false)}
                className="w-full bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors text-center block rounded-2xs"
              >
                Lanjut Belanja
              </Link>

              <Link
                href="/keranjang"
                onClick={() => setShowCenterModal(false)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors text-center flex items-center justify-center gap-1 shadow-sm rounded-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Keranjang</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GALERI LIGHTBOX */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Galeri Foto HD ({activeImageIndex + 1} / {allImages.length})
              </span>
            </div>
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition rounded-full hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center py-2 sm:py-4">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-6 z-10 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-4xl h-[78vh] flex items-center justify-center p-2">
              <Image
                src={allImages[activeImageIndex]}
                alt={`Tampilan foto HD ${activeImageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain drop-shadow-2xl rounded-xs"
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-6 z-10 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 transition transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 no-scrollbar">
            {allImages.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-14 h-18 sm:w-16 sm:h-20 shrink-0 border-2 transition overflow-hidden cursor-pointer rounded-2xs ${
                  activeImageIndex === idx
                    ? "border-amber-400 scale-105 ring-2 ring-amber-400/50"
                    : "border-neutral-800 opacity-40 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GRID DETAIL PRODUK */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* KOLOM FOTO PRODUK (3:4 PRESET FULL FIT) */}
        <div className="md:col-span-6 max-w-[440px] mx-auto w-full space-y-2.5">
          <div
            onClick={() => openLightbox(selectedImageIndex)}
            className="relative w-full aspect-[3/4] max-h-[520px] bg-stone-100 border border-stone-200 overflow-hidden group cursor-pointer rounded-xs shadow-xs"
          >
            <Image
              src={allImages[selectedImageIndex] || allImages[0]}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute top-2.5 left-2.5 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-900 border border-stone-200 shadow-2xs rounded-2xs">
              {product.category}
            </div>

            {isGrosir ? (
              <div className="absolute top-2.5 right-2.5 bg-amber-900 text-amber-100 border border-amber-700/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 rounded-2xs">
                <Tag className="w-3 h-3 text-amber-300" />
                <span>GROSIR SERI (MIN. {minGrosir} PCS)</span>
              </div>
            ) : (
              <div className="absolute top-2.5 right-2.5 bg-neutral-950 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-xs rounded-2xs">
                ECERAN SATUAN
              </div>
            )}

            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-neutral-950/90 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 flex items-center gap-2 shadow-lg rounded-2xs">
                <ZoomIn className="w-4 h-4 text-amber-300" />
                <span>Perbesar Foto HD</span>
              </div>
            </div>
          </div>

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
                    className={`relative aspect-[3/4] bg-neutral-100 border cursor-pointer overflow-hidden transition rounded-2xs ${
                      isSelected && !isThirdAndHasMore
                        ? "border-amber-900 ring-1 ring-amber-900"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />

                    {isThirdAndHasMore && (
                      <div className="absolute inset-0 bg-neutral-950/85 hover:bg-neutral-950/90 transition flex flex-col items-center justify-center text-white p-1 text-center">
                        <Images className="w-4 h-4 mb-1 text-amber-300" />
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

        {/* KOLOM INFORMASI */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-1.5 border-b border-stone-200 pb-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-widest font-bold uppercase text-neutral-400">
              <span className="text-amber-900 font-bold">
                {product.category}
              </span>
              <span className="text-stone-300">•</span>
              <span
                className={
                  currentAvailableStock > 0
                    ? "text-emerald-800 font-bold"
                    : "text-rose-600 font-bold"
                }
              >
                {currentAvailableStock > 0
                  ? isGrosir
                    ? `TOTAL STOK SERI: ${totalStokSemua} PCS`
                    : `STOK WARNA ${selectedColor}: ${activeColorStock} PCS`
                  : isGrosir
                    ? "STOK SERI HABIS"
                    : `WARNA ${selectedColor} HABIS`}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-stone-400" />
                <span>{product.weight} GR / PCS</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif text-neutral-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* HARGA */}
            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl text-neutral-950 font-black tracking-tight font-mono">
                Rp {activeUnitPrice.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                / pcs
              </span>
              {isGrosir && (
                <span className="ml-2 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-2xs">
                  Paket Seri ({minGrosir} Pcs)
                </span>
              )}
              <button
                type="button"
                onClick={handleShareLink}
                aria-label="Bagikan tautan produk"
                className="ml-auto inline-flex items-center gap-1.5 rounded-2xs border border-stone-300 px-2.5 py-1.5 text-[10px] font-bold text-stone-700 transition-colors hover:border-stone-500 hover:text-neutral-950"
              >
                <Share2 className="h-3.5 w-3.5" />
                {shareLinkCopied ? "Link disalin" : "Bagikan"}
              </button>
            </div>
          </div>

          {/* SPESIFIKASI UKURAN */}
          <div className="space-y-1 p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xs">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-neutral-500 font-bold text-[10px]">
                Ukuran Model:
              </span>
              <span className="text-[10.5px] font-bold font-mono text-neutral-950 bg-white border border-stone-300 px-2 py-0.5 rounded-2xs">
                {product.ukuran}
              </span>
            </div>
            <p className="text-[9.5px] text-stone-500">
              *1 katalog foto merupakan 1 spesifikasi ukuran standar konveksi
              ALMACO.
            </p>
          </div>

          {/* PILIHAN WARNA KHUSUS ECERAN / INFO SERI GROSIR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs uppercase">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-neutral-400 font-bold tracking-wider text-[10px]">
                  PILIHAN WARNA:
                </span>
                <span className="ml-1 font-bold text-neutral-900">
                  {isGrosir ? "Seri Campur / Mix Warna" : selectedColor}
                </span>
              </div>
            </div>

            {isGrosir ? (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[11px]">
                  <Package className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Warna Campur Otomatis Sesuai Seri Katalog</span>
                </div>
                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  Paket seri grosir otomatis mendapatkan{" "}
                  <strong>{minGrosir} warna berbeda/campur</strong> sesuai seri
                  katalog (tidak dapat memilih warna satuan).
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {rawWarnaList.map((warnaName) => {
                  const isSelected =
                    selectedColor.trim().toUpperCase() ===
                    warnaName.trim().toUpperCase();
                  const stokWarnaIni = getStockForColor(warnaName);
                  const isHabis = stokWarnaIni <= 0;

                  return (
                    <button
                      key={warnaName}
                      type="button"
                      disabled={isHabis}
                      onClick={() => setSelectedColor(warnaName)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition border cursor-pointer rounded-2xs flex items-center gap-1.5 ${
                        isHabis
                          ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through opacity-60"
                          : isSelected
                            ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs"
                            : "bg-white text-neutral-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <span>{warnaName}</span>
                      <span
                        className={`text-[8.5px] font-mono ${
                          isSelected ? "text-amber-200" : "text-stone-400"
                        }`}
                      >
                        ({isHabis ? "Habis" : `${stokWarnaIni}`})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {product.desc}
          </p>

          {/* INPUT QUANTITY */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Jumlah Pesanan{" "}
              {isGrosir ? `(Kelipatan Seri: ${minGrosir} Pcs)` : "(Pcs Satuan)"}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 bg-white rounded-2xs">
                <button
                  type="button"
                  disabled={quantity <= minAllowedQty}
                  onClick={() => {
                    setQuantity((prev) =>
                      Math.max(minAllowedQty, prev - stepQty),
                    );
                  }}
                  className="w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-stone-100 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-12 text-center text-xs font-bold font-mono text-neutral-900 border-x border-stone-200 py-2 select-none">
                  {currentAvailableStock <= 0 ? 0 : quantity}
                </span>

                <button
                  type="button"
                  disabled={
                    quantity + stepQty > currentAvailableStock ||
                    currentAvailableStock <= 0
                  }
                  onClick={() => {
                    setQuantity((prev) =>
                      Math.min(currentAvailableStock, prev + stepQty),
                    );
                  }}
                  className="w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-stone-100 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-neutral-500">
                Subtotal:{" "}
                <strong className="text-neutral-950 font-mono text-xs font-bold">
                  Rp {subtotalPrice.toLocaleString("id-ID")}
                </strong>
                {isGrosir && (
                  <span className="ml-1 text-[10px] text-amber-900 font-semibold">
                    ({Math.floor(quantity / minGrosir)} Seri)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BUTTON ADD TO CART */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={currentAvailableStock <= 0}
              className={`w-full text-xs tracking-[0.15em] font-bold uppercase py-3.5 transition active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 rounded-2xs ${
                currentAvailableStock > 0
                  ? "bg-neutral-950 hover:bg-amber-950 text-white cursor-pointer"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {currentAvailableStock > 0
                  ? isGrosir
                    ? `+ KERANJANG SERI (${quantity} PCS • RP ${subtotalPrice.toLocaleString(
                        "id-ID",
                      )})`
                    : `+ KERANJANG (${quantity} PCS • RP ${subtotalPrice.toLocaleString(
                        "id-ID",
                      )})`
                  : isGrosir
                    ? "STOK SERI HABIS"
                    : `WARNA ${selectedColor} HABIS`}
              </span>
            </button>
          </div>

          {/* ACCORDION INFORMATION */}
          <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
            <div className="border-b border-stone-100 pb-2">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full flex items-center justify-between text-left py-1 group font-bold uppercase tracking-wider text-neutral-800 cursor-pointer"
              >
                <span>Rincian Produk & Bahan</span>
                <span className="text-sm">
                  {openAccordion === "details" ? "−" : "+"}
                </span>
              </button>
              {openAccordion === "details" && (
                <div className="mt-2 text-neutral-600 space-y-1 pl-1 leading-relaxed">
                  {product.details?.map((detail: string, idx: number) => (
                    <p key={idx}>• {detail}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-stone-100 pb-2">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left py-1 group font-bold uppercase tracking-wider text-neutral-800 cursor-pointer"
              >
                <span>Pengiriman & Garansi</span>
                <span className="text-sm">
                  {openAccordion === "shipping" ? "−" : "+"}
                </span>
              </button>
              {openAccordion === "shipping" && (
                <div className="mt-2 text-neutral-600 space-y-1 pl-1 leading-relaxed">
                  <p>
                    • Pengiriman langsung dari Konveksi Dusun Jati, Mergayu,
                    Bandung, Tulungagung
                  </p>
                  <p>• Ekspedisi Reguler: JNE, J&T, SiCepat, POS Indonesia</p>
                  <p>
                    • Ekspedisi Kargo (≥10 kg): JNE JTR, SiCepat GOKIL, J&T
                    Cargo
                  </p>
                  <p>
                    • Garansi ganti produk 100% jika ditemukan cacat produksi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>

      <Footer />
    </div>
  );
}
