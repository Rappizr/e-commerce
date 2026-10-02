"use client";

import React from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, ExternalLink } from "lucide-react";

export interface OrderItem {
  id: number;
  invoice_no: string;
  status: string;
  total: number;
  total_harga?: number;
  kurir: string;
  created_at: string;
}

interface TabPesananProps {
  orders: OrderItem[];
  isLoadingOrders: boolean;
  unpaidCount: number;
}

export default function TabPesanan({
  orders,
  isLoadingOrders,
  unpaidCount,
}: TabPesananProps) {
  return (
    <div className="p-5 sm:p-8 space-y-4">
      <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
            Riwayat & Status Pesanan
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Klik pesanan untuk melihat detail invoice dan konfirmasi pembayaran.
          </p>
        </div>
        {unpaidCount > 0 && (
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-2xs">
            {unpaidCount} Invoice Menunggu Bayar
          </span>
        )}
      </div>

      {isLoadingOrders ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
          <span className="text-xs font-medium">Memuat pesanan Anda...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-center text-neutral-500 text-xs rounded-2xs space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300" />
          <p className="font-semibold text-neutral-800">
            Belum Ada Riwayat Pesanan
          </p>
          <p className="text-[11px] text-neutral-400">
            Semua pesanan yang Anda buat akan tercatat rapi di sini.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-4 py-2 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider rounded-2xs"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xs overflow-hidden">
          {orders.map((ord) => {
            const tagihan = ord.total || ord.total_harga || 0;
            const isMenunggu = ord.status === "Menunggu Pembayaran";
            const isBatal =
              ord.status === "Dibatalkan" || ord.status === "Ditolak";
            const targetInvoiceUrl = `/konfirmasi-pembayaran?invoice=${ord.invoice_no}`;

            return (
              <Link
                key={ord.id}
                href={targetInvoiceUrl}
                className={`group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors block cursor-pointer ${
                  isMenunggu
                    ? "bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-l-amber-500"
                    : "bg-white hover:bg-neutral-50"
                }`}
                title="Klik untuk melihat konfirmasi pembayaran"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-950 group-hover:underline underline-offset-2">
                      {ord.invoice_no}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isMenunggu
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : isBatal
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {new Date(ord.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • Ekspedisi: {ord.kurir || "Kurir"}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-neutral-500 block">
                      Total Tagihan:
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-black text-amber-950">
                      Rp {tagihan.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-2xs transition-colors shadow-2xs ${
                      isMenunggu
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "border border-neutral-200 group-hover:border-neutral-900 text-neutral-700 bg-white"
                    }`}
                  >
                    <span>{isMenunggu ? "Bayar" : "Detail"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
