"use client";

import React from "react";
import { Truck, RefreshCw, Filter, Search, X } from "lucide-react";

interface OrderHeaderFilterProps {
  isLoading: boolean;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  fetchOrders: () => void;
  filterTabs: { label: string; value: string }[];
  getFilteredCount: (value: string) => number;
}

export default function OrderHeaderFilter({
  isLoading,
  filterStatus,
  setFilterStatus,
  search,
  setSearch,
  fetchOrders,
  filterTabs,
  getFilteredCount,
}: OrderHeaderFilterProps) {
  return (
    <div className="shrink-0 bg-white border border-stone-200 p-4 sm:p-5 space-y-4 shadow-2xs rounded-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
              <Truck className="w-4 h-4" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Manajemen Pesanan & Resi Pengiriman
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
            Pantau pembayaran masuk, cetak label resi packing, input nomor resi
            ekspedisi, dan koordinasi pelanggan.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:border-neutral-900 bg-white hover:bg-stone-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer active:scale-95 rounded-2xs"
          title="Segarkan Data"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-amber-900 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* TAB FILTER STATUS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Status:
        </span>
        {filterTabs.map((tab) => {
          const count = getFilteredCount(tab.value);
          const isActive = filterStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition border cursor-pointer rounded-2xs flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-neutral-950 text-amber-100 border-neutral-950 shadow-2xs"
                  : "bg-[#FAF8F5] text-neutral-600 border-stone-200 hover:bg-white hover:border-stone-400"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[9px] font-mono rounded-full ${
                  isActive
                    ? "bg-amber-900 text-amber-100"
                    : "bg-stone-200 text-neutral-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Cari No. Invoice, Nama Pembeli, Catatan, WhatsApp, Kurir, atau Resi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#FAF8F5] border border-stone-300 pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-amber-900 transition-colors shadow-2xs rounded-2xs"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-neutral-900 transition p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
