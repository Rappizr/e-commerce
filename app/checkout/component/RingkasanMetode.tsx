"use client";

import React from "react";
import Image from "next/image";
import { Check, Scale, Loader2 } from "lucide-react";
import { CourierPricing } from "./JasaKirimDropdown";

interface RingkasanMetodeProps {
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  totalWeight: number;
  totalWeightKg: number;
  subtotal: number;
  shippingFee: number;
  packingFee: number;
  total: number;
  selectedCourier: CourierPricing | null;
  isLoadingShipping: boolean;
  isClient: boolean;
  isSubmittingOrder: boolean;
  checkoutItemsLength: number;
}

export default function RingkasanMetode({
  selectedBank,
  setSelectedBank,
  totalWeight,
  totalWeightKg,
  subtotal,
  shippingFee,
  packingFee,
  total,
  selectedCourier,
  isLoadingShipping,
  isClient,
  isSubmittingOrder,
  checkoutItemsLength,
}: RingkasanMetodeProps) {
  return (
    <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs sticky top-24 rounded-xs">
      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-3">
        METODE PEMBAYARAN
      </h3>

      <div
        onClick={() => setSelectedBank("bca")}
        className="flex items-center justify-between p-3.5 border-2 border-neutral-950 bg-neutral-50 shadow-xs cursor-pointer rounded-2xs"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-6 shrink-0 bg-white border border-neutral-200 flex items-center justify-center rounded-2xs">
            <Image
              src="/BCA.png"
              alt="Bank BCA"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-900 block">
              Bank BCA
            </span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
              Transfer Manual
            </span>
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-4 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
          RINCIAN PESANAN
        </h4>
        <div className="space-y-2 text-xs text-neutral-600">
          <div className="flex justify-between items-center text-neutral-700">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Scale className="w-3.5 h-3.5 text-neutral-400" />
              <span>Total Berat Pesanan</span>
            </span>
            <span className="font-semibold text-neutral-900 font-mono">
              {totalWeight} Gram ({totalWeightKg} Kg)
            </span>
          </div>

          <div className="flex justify-between">
            <span>Subtotal Produk</span>
            <span className="font-semibold text-neutral-900 font-mono">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              Ongkos Kirim (
              {selectedCourier
                ? (
                    selectedCourier.courier_name || selectedCourier.company
                  ).toUpperCase()
                : "Kurir"}
              )
            </span>
            <span className="font-semibold text-neutral-900 font-mono">
              {isLoadingShipping
                ? "Menghitung..."
                : selectedCourier
                  ? "Rp " + shippingFee.toLocaleString("id-ID")
                  : "Pilih Kurir"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span>Biaya Packing</span>
              <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                {totalWeightKg} kg (Rp 3.000/kg)
              </span>
            </div>
            <span className="font-semibold text-neutral-900 font-mono">
              Rp {packingFee.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
            <span>Total Tagihan</span>
            <span className="text-base font-bold text-neutral-950 font-mono">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {!isClient ? (
        <div className="w-full bg-neutral-400 text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md text-center rounded-2xs">
          MEMPROSES PESANAN...
        </div>
      ) : (
        <button
          type="submit"
          disabled={
            !selectedCourier ||
            isLoadingShipping ||
            isSubmittingOrder ||
            checkoutItemsLength === 0
          }
          className={`w-full text-white text-xs tracking-[0.2em] font-bold uppercase py-4 shadow-md transition flex items-center justify-center gap-2 rounded-2xs ${
            !selectedCourier ||
            isLoadingShipping ||
            isSubmittingOrder ||
            checkoutItemsLength === 0
              ? "bg-neutral-400 cursor-not-allowed"
              : "bg-neutral-950 hover:bg-black cursor-pointer active:scale-[0.99]"
          }`}
        >
          {isSubmittingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            {isSubmittingOrder ? "MEMPROSES PESANAN..." : "BAYAR SEKARANG"}
          </span>
        </button>
      )}
    </div>
  );
}
