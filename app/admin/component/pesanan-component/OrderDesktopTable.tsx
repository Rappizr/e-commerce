"use client";

import React from "react";
import {
  Loader2,
  Eye,
  MessageSquareQuote,
  Barcode,
  Printer,
  Trash2,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { OrderRecordResi, cetakLabelPacking } from "../resi";

interface OrderDesktopTableProps {
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

export default function OrderDesktopTable({
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
}: OrderDesktopTableProps) {
  return (
    <div className="hidden lg:block flex-1 bg-white border border-stone-200 shadow-2xs rounded-xs overflow-hidden">
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)]">
        <table className="w-full text-left text-xs min-w-[1100px] border-collapse">
          <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500 sticky top-0 z-20 shadow-xs">
            <tr>
              <th className="p-3.5 pl-4 bg-[#FAF8F5] min-w-[170px]">
                Invoice & Tanggal
              </th>
              <th className="p-3.5 bg-[#FAF8F5] min-w-[150px]">
                Pembeli & Kontak
              </th>
              <th className="p-3.5 max-w-[240px] bg-[#FAF8F5]">
                Rincian Item & Alamat
              </th>
              <th className="p-3.5 max-w-[180px] bg-[#FAF8F5]">
                Catatan Pembeli
              </th>
              <th className="p-3.5 bg-[#FAF8F5] min-w-[130px]">
                Ekspedisi & Resi
              </th>
              <th className="p-3.5 bg-[#FAF8F5] min-w-[110px]">
                Total Tagihan
              </th>
              <th className="p-3.5 bg-[#FAF8F5]">Status</th>
              <th className="p-3.5 pr-4 text-center bg-[#FAF8F5]">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/80 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-900" />
                  <span className="text-xs">Memuat daftar pesanan...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-stone-400 text-xs"
                >
                  Tidak ada transaksi yang cocok dengan filter atau pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const kurirAktif = (item.kurir || "REGULER").toUpperCase();
                const canCancel =
                  item.status === "Menunggu Verifikasi" ||
                  item.status === "Menunggu Pembayaran";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FCFAF7] transition-colors"
                  >
                    <td className="p-3.5 pl-4 whitespace-nowrap align-top">
                      <span className="font-bold text-neutral-950 font-mono text-xs sm:text-[13px] block tracking-tight">
                        {item.invoice_no}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap align-top">
                      <button
                        type="button"
                        onClick={() => setSelectedBuyerDetail(item)}
                        className="font-bold text-neutral-900 hover:text-amber-900 transition flex items-center gap-1.5 group cursor-pointer text-left"
                        title="Klik untuk membuka detail lengkap pembeli"
                      >
                        <span className="underline-offset-2 group-hover:underline">
                          {item.nama_pembeli}
                        </span>
                        <Eye className="w-3 h-3 text-stone-400 group-hover:text-amber-900" />
                      </button>

                      <a
                        href={generateWaUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 border border-emerald-300 rounded-2xs transition mt-1 shadow-2xs"
                        title="Hubungi Pembeli via WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>+{item.no_hp}</span>
                      </a>
                    </td>

                    <td className="p-3.5 max-w-[240px] align-top">
                      <div className="space-y-0.5">
                        {(item.order_items || []).map((prod) => (
                          <p
                            key={prod.id}
                            className="text-neutral-900 truncate text-[11px]"
                          >
                            - {prod.nama_produk} (
                            {prod.warna && prod.warna !== "Default"
                              ? prod.warna
                              : "Sesuai Katalog"}
                            , {prod.ukuran || "All Size"}){" "}
                            <strong className="font-mono">x{prod.qty}</strong>
                          </p>
                        ))}
                      </div>

                      <p
                        className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed"
                        title={item.alamat_lengkap}
                      >
                        Alamat: {item.alamat_lengkap}
                      </p>
                    </td>

                    <td className="p-3.5 max-w-[180px] align-top">
                      {item.catatan && item.catatan.trim() ? (
                        <div className="p-2 bg-amber-50/90 border border-amber-300/80 text-[10.5px] text-amber-950 rounded-2xs">
                          <div className="flex items-center gap-1 font-bold text-[8.5px] uppercase tracking-wider text-amber-900 mb-0.5">
                            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-700" />
                            <span>Catatan:</span>
                          </div>
                          <p className="italic leading-snug break-words">
                            "{item.catatan.trim()}"
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">
                          Tidak ada catatan
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap align-top">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 bg-amber-50 px-2 py-0.5 border border-amber-200 block w-fit mb-1 rounded-2xs">
                        {kurirAktif}
                      </span>
                      {item.no_resi ? (
                        <span className="font-mono font-bold text-xs text-neutral-950 flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-stone-500" />
                          {item.no_resi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic block">
                          Belum ada resi
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap align-top font-bold font-mono text-amber-950">
                      Rp{" "}
                      {Number(
                        item.total || item.total_harga || 0,
                      ).toLocaleString("id-ID")}
                    </td>

                    <td className="p-3.5 whitespace-nowrap align-top">
                      {renderStatusBadge(item.status)}
                    </td>

                    <td className="p-3.5 pr-4 text-center whitespace-nowrap align-top">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              cetakLabelPacking(
                                item,
                                resiInputs[item.id]?.no_resi ||
                                  item.no_resi ||
                                  undefined,
                                item.kurir ||
                                  resiInputs[item.id]?.kurir ||
                                  "REGULER",
                              )
                            }
                            className="px-2.5 py-1 bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 hover:bg-stone-50 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer shadow-2xs rounded-2xs"
                            title="Cetak Label Packing Pengiriman"
                          >
                            <Printer className="w-3.5 h-3.5 text-stone-600" />
                            <span>Label</span>
                          </button>

                          {canCancel && (
                            <>
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
                                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold uppercase tracking-wider transition rounded-2xs cursor-pointer"
                                title="Tolak Pesanan"
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
                                className="px-3 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer rounded-2xs"
                              >
                                Verifikasi
                              </button>
                            </>
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
                              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold uppercase inline-flex items-center gap-1 transition shadow-2xs cursor-pointer rounded-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </button>
                          )}

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
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xs transition cursor-pointer"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.status === "Diproses" && (
                          <div className="flex items-center gap-1 bg-[#FAF8F5] border border-stone-300 p-1 rounded-2xs shadow-2xs">
                            <input
                              type="text"
                              placeholder="Input No. Resi..."
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
                              className="bg-white border border-stone-300 px-2 py-1 text-[10px] font-mono uppercase focus:outline-none focus:border-amber-900 w-32 rounded-2xs"
                            />

                            <button
                              type="button"
                              disabled={isSavingResi[item.id]}
                              onClick={() => handleSimpanResi(item.id)}
                              className="px-2.5 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer disabled:opacity-60 shrink-0 rounded-2xs"
                              title="Simpan Resi & Ubah Status ke Dikirim"
                            >
                              {isSavingResi[item.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Truck className="w-3.5 h-3.5 text-amber-300" />
                              )}
                              <span>Kirim</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
