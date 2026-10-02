"use client";

import React from "react";
import { AlertTriangle, X, CheckCircle2, Loader2 } from "lucide-react";
import { OrderRecordResi } from "../resi";

interface ModalRejectOrderProps {
  rejectModal: {
    show: boolean;
    order: OrderRecordResi | null;
    alasan: string;
    isSubmitting: boolean;
  };
  setRejectModal: React.Dispatch<React.SetStateAction<any>>;
  handleConfirmReject: () => void;
  WhatsAppIcon: React.ComponentType<{ className?: string }>;
}

export default function ModalRejectOrder({
  rejectModal,
  setRejectModal,
  handleConfirmReject,
  WhatsAppIcon,
}: ModalRejectOrderProps) {
  if (!rejectModal.show || !rejectModal.order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() =>
          !rejectModal.isSubmitting &&
          setRejectModal({ ...rejectModal, show: false, order: null })
        }
      />

      <div className="relative z-10 bg-white border border-stone-200 max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-start gap-3 border-b border-stone-100 pb-3">
          <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
              Tolak Pesanan & Batalkan Transfer
            </h3>
            <p className="text-[10.5px] text-neutral-500">
              Invoice:{" "}
              <strong className="font-mono text-neutral-900">
                {rejectModal.order.invoice_no}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setRejectModal({ ...rejectModal, show: false, order: null })
            }
            className="text-stone-400 hover:text-neutral-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 rounded-2xs space-y-1">
          <span className="font-bold flex items-center gap-1 text-amber-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
            Stok Otomatis Dikembalikan:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-900/90">
            {(rejectModal.order.order_items || []).map((i, idx) => (
              <li key={idx}>
                {i.nama_produk} (
                {i.warna && i.warna !== "Default" ? i.warna : "Sesuai Katalog"},{" "}
                {i.ukuran || "All Size"}) — <strong>+{i.qty} pcs</strong>{" "}
                dikembalikan ke stok produk.
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
            Pilih Alasan Penolakan:
          </label>
          <select
            value={rejectModal.alasan}
            onChange={(e) =>
              setRejectModal({ ...rejectModal, alasan: e.target.value })
            }
            className="w-full bg-[#FAF8F5] border border-stone-300 p-2 text-xs font-semibold text-neutral-900 rounded-2xs focus:bg-white focus:outline-none focus:border-amber-900 cursor-pointer"
          >
            <option value="Stok Barang Habis">Stok Barang Habis</option>
            <option value="Bukti Transfer Tidak Valid / Tidak Masuk">
              Bukti Transfer Tidak Valid / Tidak Masuk
            </option>
            <option value="Nominal Transfer Tidak Sesuai">
              Nominal Transfer Tidak Sesuai
            </option>
            <option value="Permintaan Pembatalan Oleh Pembeli">
              Permintaan Pembatalan Oleh Pembeli
            </option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            disabled={rejectModal.isSubmitting}
            onClick={() =>
              setRejectModal({ ...rejectModal, show: false, order: null })
            }
            className="px-3.5 py-2 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-2xs hover:bg-stone-50 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={rejectModal.isSubmitting}
            onClick={handleConfirmReject}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {rejectModal.isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                <span>Tolak & Hubungi WA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
