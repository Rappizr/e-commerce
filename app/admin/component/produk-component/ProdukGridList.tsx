"use client";

import React from "react";
import Image from "next/image";
import { Loader2, PackagePlus, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { ProdukItem } from "../produk";

interface ProdukGridListProps {
  isLoading: boolean;
  displayedProducts: ProdukItem[];
  filterTipe: "semua" | "ecer" | "grosir";
  handleOpenEdit: (item: ProdukItem) => void;
  setDeleteTarget: (item: ProdukItem) => void;
  resetForm: () => void;
  setShowAddModal: (show: boolean) => void;
}

export default function ProdukGridList({
  isLoading,
  displayedProducts,
  filterTipe,
  handleOpenEdit,
  setDeleteTarget,
  resetForm,
  setShowAddModal,
}: ProdukGridListProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2 rounded-xs">
        <Loader2 className="w-6 h-6 animate-spin text-amber-900" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          Memuat katalog produk...
        </span>
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="bg-white border border-stone-200 p-8 sm:p-14 text-center text-stone-400 space-y-3 shadow-2xs rounded-xs">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <PackagePlus className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
            Tidak Ada Produk {filterTipe.toUpperCase()}
          </p>
          <p className="text-[10px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
            Belum ada produk di kategori filter ini. Mulai tambahkan busana
            sekarang.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition shadow-xs mt-2 cursor-pointer rounded-2xs"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          <span>Tambah Produk</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
        {displayedProducts.map((item) => (
          <div
            key={item.id}
            className={`bg-white border overflow-hidden flex flex-col justify-between shadow-2xs group transition-all duration-200 rounded-xs ${
              item.is_grosir
                ? "border-amber-800/40 hover:border-amber-900"
                : "border-stone-200 hover:border-stone-400"
            }`}
          >
            <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
              <Image
                src={item.gambarUtama}
                alt={item.nama}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/95 px-2 py-0.5 border border-stone-200 text-neutral-900 shadow-2xs rounded-2xs">
                {item.kategori}
              </span>

              {item.is_grosir ? (
                <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-amber-900 text-amber-100 border border-amber-700/40 px-2 py-0.5 shadow-sm flex items-center gap-1 rounded-2xs">
                  <Tag className="w-2.5 h-2.5 text-amber-300" />
                  <span>SERI ({item.min_grosir || 5} PCS)</span>
                </span>
              ) : (
                <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-neutral-950 text-white px-2 py-0.5 shadow-sm rounded-2xs">
                  ECERAN
                </span>
              )}

              <span className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider bg-neutral-950/80 text-white px-2 py-0.5 backdrop-blur-xs rounded-2xs">
                {item.gambarList?.length || 1} Foto
              </span>
            </div>

            <div className="p-2.5 sm:p-4 space-y-1.5">
              <h4 className="text-[11px] sm:text-xs font-bold text-neutral-900 line-clamp-1">
                {item.nama}
              </h4>
              <p className="text-[9px] sm:text-[11px] text-neutral-500 line-clamp-1">
                {item.ukuran.join(", ")} •{" "}
                {item.is_grosir
                  ? "Seri Campur Warna"
                  : `${item.warna.length} Warna`}{" "}
                {item.berat ? `• ${item.berat} gr` : ""}
              </p>

              <div className="pt-0.5">
                <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">
                  {item.is_grosir ? "Harga Seri: " : "Harga Satuan: "}
                  <strong className="text-neutral-950 font-bold font-mono">
                    Rp {item.harga.toLocaleString("id-ID")}
                    <span className="text-[9px] font-normal text-stone-500">
                      {" "}
                      /pcs
                    </span>
                  </strong>
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span
                  className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border rounded-2xs ${
                    item.stok > 0
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  Total Stok: {item.stok} pcs
                </span>
              </div>
            </div>

            <div className="p-2 sm:p-3 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-950 text-white hover:bg-amber-950 text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                title="Edit Produk"
              >
                <Pencil className="w-3 h-3 text-amber-300" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                title="Hapus Produk"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
