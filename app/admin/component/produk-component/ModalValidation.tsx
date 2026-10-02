"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ModalValidationProps {
  validationModal: {
    show: boolean;
    title: string;
    message: string;
  };
  setValidationModal: React.Dispatch<React.SetStateAction<any>>;
}

export default function ModalValidation({
  validationModal,
  setValidationModal,
}: ModalValidationProps) {
  if (!validationModal.show) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
              {validationModal.title}
            </h3>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Peringatan Input Form
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setValidationModal({ show: false, title: "", message: "" })
            }
            className="text-stone-400 hover:text-neutral-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed bg-[#FAF8F5] p-3 border border-stone-200 rounded-2xs">
          {validationModal.message}
        </p>

        <div className="flex items-center justify-end pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() =>
              setValidationModal({ show: false, title: "", message: "" })
            }
            className="w-full sm:w-auto px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer rounded-2xs"
          >
            Paham & Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
