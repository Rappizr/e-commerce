"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface ModalDeleteAddressProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ModalDeleteAddress({
  show,
  onClose,
  onConfirm,
}: ModalDeleteAddressProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5 text-center animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <Trash2 className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
            Hapus Alamat Ini?
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Apakah Anda yakin ingin menghapus alamat pengiriman ini dari profil
            Anda? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer rounded-2xs"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
