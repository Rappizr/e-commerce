"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ModalDeleteKategoriProps {
  deleteKategoriTarget: string | null;
  setDeleteKategoriTarget: (kat: string | null) => void;
  confirmDeleteKategori: () => void;
}

export default function ModalDeleteKategori({
  deleteKategoriTarget,
  setDeleteKategoriTarget,
  confirmDeleteKategori,
}: ModalDeleteKategoriProps) {
  if (!deleteKategoriTarget) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        onClick={() => setDeleteKategoriTarget(null)}
      />
      <div className="relative z-10 bg-white border border-stone-200 max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950 truncate">
              Hapus Kategori
            </h3>
            <p className="text-[10px] text-neutral-500 truncate">
              Hapus "{deleteKategoriTarget}"?
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus kategori{" "}
          <strong className="text-neutral-900">"{deleteKategoriTarget}"</strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setDeleteKategoriTarget(null)}
            className="px-3.5 py-1.5 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDeleteKategori}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase cursor-pointer rounded-2xs transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
