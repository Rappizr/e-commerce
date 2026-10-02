"use client";

import React from "react";
import { PackageCheck } from "lucide-react";

interface ModalConfirmStatusProps {
  statusModal: {
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    targetStatus: string;
    actionLabel: string;
  };
  setStatusModal: React.Dispatch<React.SetStateAction<any>>;
  handleConfirmStatusUpdate: () => void;
}

export default function ModalConfirmStatus({
  statusModal,
  setStatusModal,
  handleConfirmStatusUpdate,
}: ModalConfirmStatusProps) {
  if (!statusModal.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() =>
          setStatusModal({
            show: false,
            orderId: null,
            invoiceNo: "",
            targetStatus: "",
            actionLabel: "",
          })
        }
      />

      <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="w-12 h-12 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <PackageCheck className="w-6 h-6 text-amber-800" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            {statusModal.actionLabel}
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Ubah status pesanan{" "}
            <strong className="font-mono text-neutral-900 break-all">
              {statusModal.invoiceNo}
            </strong>{" "}
            menjadi{" "}
            <strong className="text-amber-950 font-bold">
              "{statusModal.targetStatus}"
            </strong>
            ?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() =>
              setStatusModal({
                show: false,
                orderId: null,
                invoiceNo: "",
                targetStatus: "",
                actionLabel: "",
              })
            }
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmStatusUpdate}
            className="w-full py-2.5 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer rounded-2xs"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
