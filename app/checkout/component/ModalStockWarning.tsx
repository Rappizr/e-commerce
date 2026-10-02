"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ModalStockWarningProps {
  warningMessage: string | null;
  onClose: () => void;
}

export default function ModalStockWarning({
  warningMessage,
  onClose,
}: ModalStockWarningProps) {
  if (!warningMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-800" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
              Perhatian Stok
            </h3>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Informasi Ketersediaan
            </p>
          </div>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed bg-[#FAF8F5] p-3 border border-stone-200 rounded-2xs">
          {warningMessage}
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition rounded-2xs cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
