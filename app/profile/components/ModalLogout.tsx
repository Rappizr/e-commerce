"use client";

import React from "react";
import { LogOut, Loader2 } from "lucide-react";

interface ModalLogoutProps {
  show: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ModalLogout({
  show,
  isLoggingOut,
  onClose,
  onConfirm,
}: ModalLogoutProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoggingOut && onClose()}
      />

      <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200/90 shadow-2xl p-6 sm:p-7 space-y-5 text-center animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <LogOut className="w-5 h-5 ml-0.5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
            Konfirmasi Keluar Akun
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Apakah Anda yakin ingin keluar dari akun ini? Anda perlu masuk
            kembali untuk mengakses riwayat dan alamat belanja.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onClose}
            className="w-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onConfirm}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase tracking-wider py-2.5 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-rose-400 rounded-2xs"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Ya, Keluar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
