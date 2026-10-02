"use client";

import React from "react";
import { User, X, Phone, MapPin, MessageSquareQuote } from "lucide-react";
import { OrderRecordResi } from "../resi";

interface ModalBuyerDetailProps {
  selectedBuyerDetail: OrderRecordResi | null;
  setSelectedBuyerDetail: (order: OrderRecordResi | null) => void;
  generateWaUrl: (item: OrderRecordResi) => string;
  WhatsAppIcon: React.ComponentType<{ className?: string }>;
}

export default function ModalBuyerDetail({
  selectedBuyerDetail,
  setSelectedBuyerDetail,
  generateWaUrl,
  WhatsAppIcon,
}: ModalBuyerDetailProps) {
  if (!selectedBuyerDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => setSelectedBuyerDetail(null)}
      />

      <div className="relative z-10 w-full max-w-md bg-white border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
              <User className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
              Rincian Informasi Pembeli
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBuyerDetail(null)}
            className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              No. Invoice:
            </span>
            <span className="font-mono font-bold text-neutral-950 text-sm">
              {selectedBuyerDetail.invoice_no}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Nama Penerima:
            </span>
            <p className="font-bold text-neutral-950 text-sm">
              {selectedBuyerDetail.nama_pembeli}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Nomor WhatsApp / Kontak:
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-neutral-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-500" />+
                {selectedBuyerDetail.no_hp}
              </span>
              <a
                href={generateWaUrl(selectedBuyerDetail)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-300 rounded-2xs transition"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chat WA</span>
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Alamat Lengkap Pengiriman:
            </span>
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-2xs text-neutral-700 flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <span>{selectedBuyerDetail.alamat_lengkap}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Catatan dari Pembeli:
            </span>
            {selectedBuyerDetail.catatan &&
            selectedBuyerDetail.catatan.trim() ? (
              <div className="p-2.5 bg-amber-50/90 border border-amber-300 text-amber-950 rounded-2xs flex items-start gap-2 leading-relaxed">
                <MessageSquareQuote className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span className="font-medium italic">
                  "{selectedBuyerDetail.catatan.trim()}"
                </span>
              </div>
            ) : (
              <div className="p-2 bg-stone-50 border border-stone-200 rounded-2xs text-stone-400 italic">
                Tidak ada catatan yang disertakan oleh pembeli.
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedBuyerDetail(null)}
            className="w-full sm:w-auto px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
