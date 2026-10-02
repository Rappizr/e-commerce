"use client";

import React from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, Package } from "lucide-react";

interface CheckoutItemListProps {
  checkoutItems: any[];
  catatan: string;
  setCatatan: (val: string) => void;
  handleRemoveCheckoutItem: (
    id: string | number,
    size?: string,
    color?: string,
  ) => void;
  handleUpdateQtyCheckout: (item: any, direction: number) => void;
  getProductStock: (item: any) => number;
}

export default function CheckoutItemList({
  checkoutItems,
  catatan,
  setCatatan,
  handleRemoveCheckoutItem,
  handleUpdateQtyCheckout,
  getProductStock,
}: CheckoutItemListProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {checkoutItems.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-4">
          Tidak ada produk terpilih untuk di-checkout.
        </p>
      ) : (
        checkoutItems.map((item: any) => {
          const isGrosir = Boolean(item.is_grosir);
          const minGrosir = Math.max(
            1,
            parseInt(String(item.min_grosir || 5), 10),
          );
          const currentQty = Math.max(1, parseInt(String(item.qty || 1), 10));
          const minAllowed = isGrosir ? minGrosir : 1;
          const maxStock = getProductStock(item);
          const step = isGrosir ? minGrosir : 1;
          const isMaxStockReached = currentQty + step > maxStock;

          return (
            <div
              key={`${item.id}-${item.size}-${item.color}`}
              className="flex flex-col space-y-2 border-b border-neutral-100 pb-4 last:border-none last:pb-0"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="relative w-16 h-20 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden rounded-2xs">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isGrosir ? (
                        <span className="bg-amber-900 text-amber-100 text-[8px] font-bold px-1.5 py-0.2 rounded-2xs">
                          SERI GROSIR
                        </span>
                      ) : (
                        <span className="bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-2xs">
                          ECERAN
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      {item.size || "All Size"} ({item.color || "Default"})
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-amber-950 font-mono">
                        Rp {Number(item.price || 0).toLocaleString("id-ID")}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        (Stok: {maxStock})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveCheckoutItem(item.id, item.size, item.color)
                    }
                    className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-2xs flex items-center justify-center transition cursor-pointer"
                    title="Hapus dari Checkout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center border border-neutral-300 rounded-2xs bg-white">
                    <button
                      type="button"
                      disabled={currentQty <= minAllowed}
                      onClick={() => handleUpdateQtyCheckout(item, -1)}
                      className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-r border-neutral-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-neutral-800">
                      {currentQty}
                    </span>
                    <button
                      type="button"
                      disabled={isMaxStockReached}
                      onClick={() => handleUpdateQtyCheckout(item, 1)}
                      className="w-7 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-950 border-l border-neutral-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {isGrosir && (
                <div className="p-2 bg-amber-50/80 border border-amber-200/90 rounded-xs flex items-center justify-between text-amber-950 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-800" />
                    <span>
                      Paket Seri Grosir Otomatis Campur Warna ({currentQty} Pcs)
                    </span>
                  </div>
                  <span className="bg-amber-900 text-amber-100 px-2 py-0.5 rounded-2xs font-mono text-[9px]">
                    MIN. {minGrosir} PCS
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="pt-2">
        <input
          type="text"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Tulis Catatan Buat Penjual..."
          className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
        />
      </div>
    </div>
  );
}
