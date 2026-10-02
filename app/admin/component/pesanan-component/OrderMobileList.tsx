"use client";

import React from "react";
import {
  Loader2,
  Trash2,
  Eye,
  MessageSquareQuote,
  Barcode,
  Printer,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { OrderRecordResi, cetakLabelPacking } from "../resi";

interface OrderMobileListProps {
  isLoading: boolean;
  filtered: OrderRecordResi[];
  resiInputs: { [key: number]: { no_resi: string; kurir: string } };
  setResiInputs: React.Dispatch<
    React.SetStateAction<{ [key: number]: { no_resi: string; kurir: string } }>
  >;
  isSavingResi: { [key: number]: boolean };
  handleSimpanResi: (orderId: number) => void;
  setSelectedBuyerDetail: (order: OrderRecordResi) => void;
  setDeleteModal: (modal: any) => void;
  setRejectModal: (modal: any) => void;
  openStatusModal: (
    orderId: number,
    invoiceNo: string,
    targetStatus: string,
    actionLabel: string,
  ) => void;
  generateWaUrl: (item: OrderRecordResi) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
  WhatsAppIcon: React.ComponentType<{ className?: string }>;
}

export default function OrderMobileList({
  isLoading,
  filtered,
  resiInputs,
  setResiInputs,
  isSavingResi,
  handleSimpanResi,
  setSelectedBuyerDetail,
  setDeleteModal,
  setRejectModal,
  openStatusModal,
  generateWaUrl,
  renderStatusBadge,
  WhatsAppIcon,
}: OrderMobileListProps) {
  return (
    <div className="block lg:hidden flex-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 space-y-3">
      {isLoading ? (
        <div className="bg-white border border-stone-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 rounded-xs">
          <Loader2 className="w-5 h-5 animate-spin text-amber-900" />
          <span className="text-xs font-semibold">
            Memuat daftar pesanan...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 p-8 text-center text-stone-400 text-xs shadow-2xs rounded-xs">
          Tidak ada pesanan yang cocok dengan kriteria pencarian / filter ini.
        </div>
      ) : (
        filtered.map((item) => {
          const kurirAktif = (item.kurir || "REGULER").toUpperCase();
          const canCancel =
            item.status === "Menunggu Verifikasi" ||
            item.status === "Menunggu Pembayaran";

          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200 p-4 space-y-3 shadow-2xs rounded-xs"
            >
              <div className="flex items-start justify-between border-b border-stone-100 pb-2.5 gap-2">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-xs sm:text-sm text-neutral-950 block truncate">
                    {item.invoice_no}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderStatusBadge(item.status)}
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal({
                        show: true,
                        orderId: item.id,
                        invoiceNo: item.invoice_no,
                        isDeleting: false,
                      })
                    }
                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition rounded cursor-pointer"
                    title="Hapus Pesanan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedBuyerDetail(item)}
                    className="font-bold text-neutral-900 hover:text-amber-900 transition flex items-center gap-1 group text-left cursor-pointer"
                    title="Klik untuk melihat detail lengkap pembeli"
                  >
                    <span>{item.nama_pembeli}</span>
                    <Eye className="w-3 h-3 text-stone-400 group-hover:text-amber-900" />
                  </button>

                  <a
                    href={generateWaUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 border border-emerald-300 rounded-2xs transition shadow-2xs"
                    title="Hubungi Pembeli via WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Chat WA</span>
                  </a>
                </div>

                <div className="space-y-0.5 pt-1 bg-[#FAF8F5] p-2 border border-stone-200/80 rounded-2xs">
                  {(item.order_items || []).map((prod) => (
                    <p
                      key={prod.id}
                      className="text-[11px] text-neutral-800 line-clamp-1"
                    >
                      - {prod.nama_produk} (
                      {prod.warna && prod.warna !== "Default"
                        ? prod.warna
                        : "Sesuai Katalog"}
                      , {prod.ukuran || "All Size"}){" "}
                      <span className="font-bold font-mono">x{prod.qty}</span>
                    </p>
                  ))}
                </div>

                {item.catatan && item.catatan.trim() && (
                  <div className="p-2 bg-amber-50/90 border border-amber-300/80 text-[10px] text-amber-950 rounded-2xs flex items-start gap-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[8.5px] text-amber-900 block">
                        Catatan:
                      </span>
                      <span className="italic leading-snug">
                        "{item.catatan.trim()}"
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                  Alamat: {item.alamat_lengkap}
                </p>

                <div className="mt-1.5 p-2 bg-stone-50 border border-stone-200 text-[10px] flex items-center justify-between rounded-2xs">
                  <span className="font-bold uppercase text-neutral-700">
                    Kurir: {kurirAktif}
                  </span>
                  <span className="font-mono font-bold text-amber-950 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-stone-500" />
                    {item.no_resi || "Belum Ada Resi"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                  <span className="text-neutral-500 text-[11px]">
                    Total Tagihan:
                  </span>
                  <span className="font-bold text-amber-950 font-mono text-xs sm:text-sm">
                    Rp{" "}
                    {Number(item.total || item.total_harga || 0).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    cetakLabelPacking(
                      item,
                      resiInputs[item.id]?.no_resi || item.no_resi || undefined,
                      item.kurir || resiInputs[item.id]?.kurir || "REGULER",
                    )
                  }
                  className="w-full py-2 bg-white border border-stone-300 hover:bg-stone-50 text-neutral-800 text-[11px] font-bold uppercase inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs rounded-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-600" />
                  <span>Cetak Label Packing</span>
                </button>

                {item.status === "Diproses" && (
                  <div className="p-2.5 bg-[#FAF8F5] border border-amber-200/80 space-y-2 rounded-2xs">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase text-amber-900">
                        Input Nomor Resi:
                      </span>
                      <span className="bg-neutral-900 text-amber-100 font-mono font-bold px-1.5 py-0.2 rounded-2xs">
                        {kurirAktif}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Masukkan No. Resi..."
                        value={resiInputs[item.id]?.no_resi || ""}
                        onChange={(e) =>
                          setResiInputs((prev) => ({
                            ...prev,
                            [item.id]: {
                              no_resi: e.target.value,
                              kurir: item.kurir || "",
                            },
                          }))
                        }
                        className="flex-1 bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-amber-900 rounded-2xs"
                      />

                      <button
                        type="button"
                        disabled={isSavingResi[item.id]}
                        onClick={() => handleSimpanResi(item.id)}
                        className="px-3.5 py-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0 shadow-2xs rounded-2xs"
                      >
                        {isSavingResi[item.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Kirim</span>
                      </button>
                    </div>
                  </div>
                )}

                {canCancel && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRejectModal({
                          show: true,
                          order: item,
                          alasan: "Stok Barang Habis",
                          isSubmitting: false,
                        })
                      }
                      className="w-full py-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-bold uppercase tracking-wider transition rounded-2xs text-center cursor-pointer"
                    >
                      Tolak
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openStatusModal(
                          item.id,
                          item.invoice_no,
                          "Diproses",
                          "Verifikasi Pembayaran",
                        )
                      }
                      className="w-full py-2.5 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider transition shadow-2xs text-center cursor-pointer rounded-2xs"
                    >
                      Verifikasi
                    </button>
                  </div>
                )}

                {item.status === "Dikirim" && (
                  <button
                    type="button"
                    onClick={() =>
                      openStatusModal(
                        item.id,
                        item.invoice_no,
                        "Selesai",
                        "Tandai Selesai",
                      )
                    }
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold uppercase inline-flex items-center gap-1 transition shadow-2xs text-center cursor-pointer rounded-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
