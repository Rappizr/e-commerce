"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ModalDeleteOrderProps {
  deleteModal: {
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    isDeleting: boolean;
  };
  setDeleteModal: React.Dispatch<React.SetStateAction<any>>;
  handleConfirmDelete: () => void;
}

export default function ModalDeleteOrder({
  deleteModal,
  setDeleteModal,
  handleConfirmDelete,
}: ModalDeleteOrderProps) {
  if (!deleteModal.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() =>
          !deleteModal.isDeleting &&
          setDeleteModal({
            show: false,
            orderId: null,
            invoiceNo: "",
            isDeleting: false,
          })
        }
      />

      <div className="relative z-10 w-full max-w-sm bg-white border border-rose-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            Hapus Pesanan
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus transaksi{" "}
            <strong className="font-mono text-neutral-900 break-all">
              {deleteModal.invoiceNo}
            </strong>{" "}
            secara permanen?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            disabled={deleteModal.isDeleting}
            onClick={() =>
              setDeleteModal({
                show: false,
                orderId: null,
                invoiceNo: "",
                isDeleting: false,
              })
            }
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition disabled:opacity-60 cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={deleteModal.isDeleting}
            onClick={handleConfirmDelete}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer rounded-2xs"
          >
            {deleteModal.isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Hapus Pesanan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
