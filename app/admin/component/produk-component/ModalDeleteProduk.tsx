"use client";

import React from "react";
import Image from "next/image";
import { AlertTriangle, X } from "lucide-react";
import { ProdukItem } from "../produk";

interface ModalDeleteProdukProps {
  deleteTarget: ProdukItem | null;
  setDeleteTarget: (item: ProdukItem | null) => void;
  confirmDelete: () => void;
}

export default function ModalDeleteProduk({
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
}: ModalDeleteProdukProps) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={() => setDeleteTarget(null)} />
      <div className="relative z-10 bg-white border border-stone-200 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                Konfirmasi Hapus Produk
              </h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                Data akan dihapus permanen dari Supabase.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDeleteTarget(null)}
            className="p-1 text-stone-400 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 bg-[#FAF8F5] border border-stone-200 flex items-center gap-3 rounded-2xs">
          <div className="relative w-10 h-10 bg-neutral-200 shrink-0 border border-stone-300 rounded-2xs overflow-hidden">
            <Image
              src={deleteTarget.gambarUtama}
              alt={deleteTarget.nama}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-bold text-neutral-900 truncate">
              {deleteTarget.nama}
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              Rp {deleteTarget.harga.toLocaleString("id-ID")} • Total Stok:{" "}
              {deleteTarget.stok}{" "}
              {deleteTarget.berat ? `• Berat: ${deleteTarget.berat} gr` : ""}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus produk ini secara permanen dari
          database etalase toko?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-3.5 py-1.5 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase cursor-pointer shadow-xs rounded-2xs transition"
          >
            Ya, Hapus Produk
          </button>
        </div>
      </div>
    </div>
  );
}
