"use client";

import React from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export interface CourierPricing {
  company: string;
  courier_name: string;
  courier_service_name: string;
  duration: string;
  price: number;
}

interface JasaKirimDropdownProps {
  isClient: boolean;
  isLoadingShipping: boolean;
  shippingOptions: CourierPricing[];
  selectedCourier: CourierPricing | null;
  setSelectedCourier: (courier: CourierPricing) => void;
  showCourierDropdown: boolean;
  setShowCourierDropdown: (val: boolean) => void;
  courierDropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function JasaKirimDropdown({
  isClient,
  isLoadingShipping,
  shippingOptions,
  selectedCourier,
  setSelectedCourier,
  showCourierDropdown,
  setShowCourierDropdown,
  courierDropdownRef,
}: JasaKirimDropdownProps) {
  return (
    <div className="bg-[#F1F3F5] p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="text-xs text-neutral-800">
        <span>
          Dikirim dari:{" "}
          <strong className="text-neutral-950 font-bold">Tulungagung</strong>
        </span>
      </div>

      <div className="relative" ref={courierDropdownRef}>
        {!isClient ? (
          <div className="bg-neutral-400 text-white text-xs font-bold px-4 py-2.5 rounded-2xs flex items-center justify-between gap-3 min-w-[200px]">
            <span>PILIH JASA KIRIM</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </div>
        ) : (
          <button
            type="button"
            disabled={isLoadingShipping || shippingOptions.length === 0}
            onClick={() => setShowCourierDropdown(!showCourierDropdown)}
            className="bg-[#0F2137] hover:bg-[#182F4D] text-white text-xs font-bold px-4 py-2.5 rounded-2xs flex items-center justify-between gap-3 min-w-[200px] shadow-xs cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed"
          >
            {isLoadingShipping ? (
              <div className="flex items-center gap-2 mx-auto">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat Tarif...</span>
              </div>
            ) : selectedCourier ? (
              <>
                <span className="truncate uppercase tracking-wide">
                  {selectedCourier.courier_name || selectedCourier.company}{" "}
                  {selectedCourier.courier_service_name} (
                  {selectedCourier.duration})
                </span>
                <ChevronDown className="w-4 h-4 shrink-0" />
              </>
            ) : (
              <>
                <span>PILIH JASA KIRIM</span>
                <ChevronDown className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        )}

        {showCourierDropdown && shippingOptions.length > 0 && (
          <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-w-[90vw] bg-white border border-neutral-300 shadow-2xl rounded-2xs z-40 py-1 max-h-64 overflow-y-auto">
            {shippingOptions.map((opt, idx) => {
              const isSelected =
                (selectedCourier?.courier_name || selectedCourier?.company) ===
                  (opt.courier_name || opt.company) &&
                selectedCourier?.courier_service_name ===
                  opt.courier_service_name;

              return (
                <div
                  key={`${opt.company}-${opt.courier_service_name}-${idx}`}
                  onClick={() => {
                    setSelectedCourier(opt);
                    setShowCourierDropdown(false);
                  }}
                  className={`px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-neutral-100 font-bold text-neutral-950"
                      : "hover:bg-neutral-50 text-neutral-800"
                  }`}
                >
                  <div>
                    <p className="uppercase">
                      {opt.courier_name || opt.company}{" "}
                      {opt.courier_service_name} ({opt.duration})
                    </p>
                  </div>
                  <span className="font-bold shrink-0 ml-2 text-neutral-950 font-mono">
                    Rp {opt.price.toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
