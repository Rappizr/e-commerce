"use client";

import React from "react";
import { Plus, Layers, ShoppingBag, Tag } from "lucide-react";
import { ProdukItem } from "../produk";

interface ProdukHeaderFilterProps {
  produk: ProdukItem[];
  filterTipe: "semua" | "ecer" | "grosir";
  setFilterTipe: (tipe: "semua" | "ecer" | "grosir") => void;
  resetForm: () => void;
  setShowAddModal: (show: boolean) => void;
}

export default function ProdukHeaderFilter({
  produk,
  filterTipe,
  setFilterTipe,
  resetForm,
  setShowAddModal,
}: ProdukHeaderFilterProps) {
  return (
    <div className="bg-white p-4 sm:p-5 border border-stone-200 shadow-2xs rounded-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Katalog Produk (Eceran & Seri Grosir Terpisah)
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
            Kelola etalase pakaian satuan (ecer) dan paket seri grosir konveksi
            secara terpisah.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer rounded-2xs"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* TAB FILTER TIPE */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
        <button
          type="button"
          onClick={() => setFilterTipe("semua")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition cursor-pointer ${
            filterTipe === "semua"
              ? "bg-neutral-950 text-white shadow-2xs"
              : "bg-stone-50 text-neutral-600 hover:bg-stone-100"
          }`}
        >
          Semua ({produk.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTipe("ecer")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition flex items-center gap-1 cursor-pointer ${
            filterTipe === "ecer"
              ? "bg-neutral-950 text-white shadow-2xs"
              : "bg-stone-50 text-neutral-600 hover:bg-stone-100"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            Eceran Satuan ({produk.filter((p) => !p.is_grosir).length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilterTipe("grosir")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition flex items-center gap-1 cursor-pointer ${
            filterTipe === "grosir"
              ? "bg-amber-900 text-white shadow-2xs"
              : "bg-amber-50 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Seri Grosir ({produk.filter((p) => p.is_grosir).length})</span>
        </button>
      </div>
    </div>
  );
}
