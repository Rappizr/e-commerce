"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  X,
  Eye,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";

interface VerifikasiItem {
  id: number;
  invoice_no: string;
  nama_pembeli: string;
  no_hp: string;
  bank_asal: string;
  total: number;
  bukti_transfer_url: string;
  status: string;
  created_at: string;
  order_items: {
    product_id?: number;
    nama_produk: string;
    qty: number;
    warna?: string;
    ukuran?: string;
  }[];
}

function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.182 8.182 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function VerifikasiBayarComponent() {
  const [konfirmasiList, setKonfirmasiList] = useState<VerifikasiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBukti, setSelectedBukti] = useState<VerifikasiItem | null>(
    null,
  );

  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    invoiceId: string;
  } | null>(null);

  // State Modal Tolak Pembayaran
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    order: VerifikasiItem | null;
    alasan: string;
    catatanTambahan: string;
    isSubmitting: boolean;
  }>({
    show: false,
    order: null,
    alasan: "Stok Barang Habis",
    catatanTambahan: "",
    isSubmitting: false,
  });

  const fetchVerifikasiFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          invoice_no,
          nama_pembeli,
          no_hp,
          bank_asal,
          total,
          total_harga,
          bukti_transfer_url,
          bukti_transfer,
          status,
          created_at,
          order_items (
            product_id,
            nama_produk,
            qty,
            warna,
            ukuran
          )
        `,
        )
        .or("status.eq.Menunggu Verifikasi,status.eq.Menunggu Pembayaran")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: VerifikasiItem[] = data.map((item: any) => ({
          id: item.id,
          invoice_no: item.invoice_no,
          nama_pembeli: item.nama_pembeli,
          no_hp: item.no_hp || "",
          bank_asal: item.bank_asal || "BCA",
          total: Number(item.total || item.total_harga || 0),
          bukti_transfer_url:
            item.bukti_transfer_url || item.bukti_transfer || "",
          status: item.status,
          created_at: item.created_at,
          order_items: item.order_items || [],
        }));
        setKonfirmasiList(mapped);
      }
    } catch (err) {
      console.error("Fetch verifikasi error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasiFromSupabase();
  }, []);

  // Format WhatsApp untuk penolakan
  const generateWaTolakUrl = (
    order: VerifikasiItem,
    alasan: string,
    catatanTambahan: string,
  ) => {
    const rawWa = order.no_hp ? String(order.no_hp).replace(/[^0-9]/g, "") : "";
    const phone = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : rawWa;

    const itemsSummary = (order.order_items || [])
      .map(
        (i) =>
          `- ${i.nama_produk} (${i.ukuran || "All Size"}, ${i.warna || "Default"}) x${i.qty}`,
      )
      .join("\n");

    const totalFormat = `Rp ${Number(order.total).toLocaleString("id-ID")}`;

    let penjelasan = "";
    if (alasan === "Stok Barang Habis") {
      penjelasan =
        "Mohon maaf yang sebesar-besarnya, stok busana yang Anda pesan saat ini sedang habis terjual. Jika Anda sudah terlanjur melakukan transfer dana, mohon segera kirimkan nomor rekening Anda agar dana kami kembalikan 100% (Refund).";
    } else if (alasan === "Bukti Transfer Tidak Valid / Tidak Masuk") {
      penjelasan =
        "Kami telah memeriksa mutasi rekening kami, namun dana transfer Anda belum masuk atau bukti transfer yang diunggah kurang jelas/tidak valid. Mohon kirimkan ulang struk resmi mutasi bank Anda.";
    } else {
      penjelasan = `Keterangan: ${alasan}.${catatanTambahan ? `\nCatatan Admin: ${catatanTambahan}` : ""}`;
    }

    const text = `Halo Kak *${order.nama_pembeli}*,

Kami dari Admin *ALMACO FASHION* ingin menginformasikan terkait pesanan Anda:
*No. Invoice:* ${order.invoice_no}

*Detail Produk:*
${itemsSummary}
*Total:* ${totalFormat}

*Status Pesanan: DIBATALKAN / DITOLAK*

*Keterangan:*
${penjelasan}

Jika ada pertanyaan atau butuh bantuan lebih lanjut, silakan balas pesan ini ya Kak. Terima kasih banyak atas pengertiannya. 🙏`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Setujui Pembayaran
  const handleApprove = async (
    orderId: number,
    invoiceNo: string,
    nominal: number,
  ) => {
    try {
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "Diproses" })
        .eq("id", orderId);

      if (orderErr) throw orderErr;

      await supabase.from("cash_flow").insert([
        {
          order_id: orderId,
          tipe: "Pemasukan",
          kategori: "Penjualan Produk",
          nominal: nominal,
          keterangan: `Pembayaran Lunas Invoice: ${invoiceNo}`,
          tanggal: new Date().toISOString().split("T")[0],
        },
      ]);

      setKonfirmasiList((prev) => prev.filter((item) => item.id !== orderId));
      setSuccessModal({ show: true, invoiceId: invoiceNo });
      setSelectedBukti(null);
    } catch (err: any) {
      console.error("Gagal menyetujui pembayaran:", err);
      alert("Gagal menyetujui pembayaran: " + err.message);
    }
  };

  // Tolak Pembayaran + Kembalikan Stok Produk
  const handleConfirmReject = async () => {
    const { order, alasan, catatanTambahan } = rejectModal;
    if (!order) return;

    setRejectModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // 1. KEMBALIKAN STOK KE TABEL PRODUCTS
      for (const item of order.order_items || []) {
        if (item.product_id) {
          const { data: currentProduct } = await supabase
            .from("products")
            .select("stok")
            .eq("id", item.product_id)
            .single();

          if (currentProduct) {
            await supabase
              .from("products")
              .update({ stok: (currentProduct.stok || 0) + item.qty })
              .eq("id", item.product_id);
          }
        } else {
          const { data: currentProduct } = await supabase
            .from("products")
            .select("id, stok")
            .eq("nama", item.nama_produk)
            .single();

          if (currentProduct) {
            await supabase
              .from("products")
              .update({ stok: (currentProduct.stok || 0) + item.qty })
              .eq("id", currentProduct.id);
          }
        }
      }

      // 2. UPDATE STATUS PESANAN JADI DIBATALKAN
      const reasonFull = catatanTambahan
        ? `${alasan}: ${catatanTambahan}`
        : alasan;

      const { error } = await supabase
        .from("orders")
        .update({
          status: "Dibatalkan",
          catatan: reasonFull,
        })
        .eq("id", order.id);

      if (error) throw error;

      // Hapus dari antrean verifikasi
      setKonfirmasiList((prev) => prev.filter((item) => item.id !== order.id));
      setSelectedBukti(null);

      // Buka tautan WhatsApp untuk chat pembeli
      const waUrl = generateWaTolakUrl(order, alasan, catatanTambahan);
      window.open(waUrl, "_blank");
    } catch (err: any) {
      console.error("Gagal menolak pesanan:", err);
      alert("Gagal menolak pesanan: " + err.message);
    } finally {
      setRejectModal({
        show: false,
        order: null,
        alasan: "Stok Barang Habis",
        catatanTambahan: "",
        isSubmitting: false,
      });
    }
  };

  const filtered = konfirmasiList.filter((item) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      item.invoice_no?.toLowerCase().includes(q) ||
      item.nama_pembeli?.toLowerCase().includes(q) ||
      item.bank_asal?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 w-full">
      {/* HEADER & PENCARIAN */}
      <div className="bg-white border border-stone-200 p-3.5 sm:p-4 shadow-xs space-y-3 rounded-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Verifikasi Pembayaran Masuk ({konfirmasiList.length})
            </h2>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
              Cek kesesuaian struk transfer yang dikirim pembeli dan verifikasi
              pesanan.
            </p>
          </div>

          <button
            onClick={fetchVerifikasiFromSupabase}
            className="p-2 border border-stone-300 hover:border-neutral-900 bg-white text-neutral-700 transition rounded-2xs cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-900 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari Invoice (ORD-2026...), Nama Pembeli, atau Bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-stone-300 pl-8 pr-8 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-amber-900 transition-colors rounded-2xs"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-neutral-900 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-stone-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-xs rounded-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-900" />
            <span className="text-xs font-semibold">
              Memuat Data Verifikasi...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 p-6 text-center text-stone-400 text-xs shadow-xs rounded-xs">
            Belum ada pembayaran yang perlu diverifikasi saat ini.
          </div>
        ) : (
          filtered.map((item) => {
            const hasBukti = Boolean(item.bukti_transfer_url);

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 p-4 space-y-3 shadow-xs rounded-xs"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 gap-2">
                  <span className="font-mono font-bold text-xs text-neutral-900 truncate">
                    {item.invoice_no}
                  </span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xs whitespace-nowrap">
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pengirim:</span>
                    <span className="font-bold text-neutral-900">
                      {item.nama_pembeli}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Bank:</span>
                    <span className="text-neutral-700 font-semibold">
                      {item.bank_asal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total:</span>
                    <span className="font-bold text-amber-950 font-mono">
                      Rp {item.total?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    disabled={!hasBukti}
                    onClick={() => setSelectedBukti(item)}
                    className={`inline-flex items-center justify-center gap-1 px-2 py-2 border text-[10px] font-semibold transition-colors shadow-2xs rounded-2xs cursor-pointer ${
                      hasBukti
                        ? "bg-white hover:bg-stone-50 text-neutral-800 border-stone-300"
                        : "bg-stone-50 text-stone-400 border-stone-200 cursor-not-allowed"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>{hasBukti ? "Lihat" : "Belum"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRejectModal({
                        show: true,
                        order: item,
                        alasan: "Stok Barang Habis",
                        catatanTambahan: "",
                        isSubmitting: false,
                      })
                    }
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold uppercase tracking-wider transition rounded-2xs cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Tolak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApprove(item.id, item.invoice_no, item.total)
                    }
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-2xs rounded-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TAMPILAN DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-stone-200 overflow-x-auto shadow-2xs rounded-xs">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3.5 pl-4 min-w-[170px]">Invoice</th>
              <th className="p-3.5">Pengirim & Bank</th>
              <th className="p-3.5">Jumlah Transfer</th>
              <th className="p-3.5">Bukti Foto</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 pr-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-amber-900" />
                  <span>Memuat data verifikasi...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-stone-400 text-xs"
                >
                  Belum ada pembayaran yang perlu diverifikasi saat ini.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const hasBukti = Boolean(item.bukti_transfer_url);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FCFAF7] transition-colors"
                  >
                    <td className="p-3.5 pl-4 font-mono font-bold text-neutral-950 whitespace-nowrap text-xs sm:text-[13px]">
                      {item.invoice_no}
                    </td>
                    <td className="p-3.5">
                      <span className="block font-bold text-neutral-900">
                        {item.nama_pembeli}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Bank: {item.bank_asal}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-amber-950">
                      Rp {item.total?.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5">
                      {hasBukti ? (
                        <button
                          type="button"
                          onClick={() => setSelectedBukti(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-neutral-800 border border-stone-300 text-[11px] font-semibold transition-colors shadow-2xs rounded-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-600" />
                          <span>Lihat Foto</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">
                          Belum Dikirim
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xs whitespace-nowrap">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* TOMBOL TOLAK */}
                        <button
                          type="button"
                          onClick={() =>
                            setRejectModal({
                              show: true,
                              order: item,
                              alasan: "Stok Barang Habis",
                              catatanTambahan: "",
                              isSubmitting: false,
                            })
                          }
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold uppercase tracking-wider transition rounded-2xs cursor-pointer"
                          title="Tolak Pesanan & Kembalikan Stok"
                        >
                          Tolak
                        </button>

                        {/* TOMBOL SETUJUI */}
                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(item.id, item.invoice_no, item.total)
                          }
                          className="inline-flex items-center gap-1 px-4 py-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-2xs rounded-2xs cursor-pointer"
                        >
                          <Check className="w-3 h-3 text-amber-300" />
                          <span>Setujui</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PRATINJAU BUKTI STRUK */}
      {selectedBukti && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBukti(null)}
          />

          <div className="relative z-10 bg-white border border-stone-200 shadow-2xl p-4 sm:p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between rounded-xs">
            <div className="flex justify-between items-start pb-3 border-b border-stone-200">
              <div className="min-w-0 pr-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                  Bukti Transfer Struk
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono truncate">
                  {selectedBukti.invoice_no} — {selectedBukti.nama_pembeli} (Rp{" "}
                  {selectedBukti.total?.toLocaleString("id-ID")})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBukti(null)}
                className="p-1 text-stone-400 hover:text-neutral-900 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[3/4] w-full max-h-[50vh] bg-stone-50 border border-stone-200 overflow-hidden flex items-center justify-center rounded-2xs">
              <Image
                src={selectedBukti.bukti_transfer_url}
                alt="Bukti Transfer Struk"
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedBukti(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold uppercase py-2.5 transition text-center cursor-pointer rounded-2xs"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetOrder = selectedBukti;
                  setSelectedBukti(null);
                  setRejectModal({
                    show: true,
                    order: targetOrder,
                    alasan: "Stok Barang Habis",
                    catatanTambahan: "",
                    isSubmitting: false,
                  });
                }}
                className="w-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold uppercase py-2.5 transition text-center cursor-pointer rounded-2xs"
              >
                Tolak
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApprove(
                    selectedBukti.id,
                    selectedBukti.invoice_no,
                    selectedBukti.total,
                  )
                }
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase py-2.5 transition text-center shadow-xs flex items-center justify-center gap-1.5 cursor-pointer rounded-2xs"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>Setujui</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOLAK PESANAN & KEMBALIKAN STOK */}
      {rejectModal.show && rejectModal.order && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() =>
              !rejectModal.isSubmitting &&
              setRejectModal({ ...rejectModal, show: false, order: null })
            }
          />

          <div className="relative z-10 bg-white border border-stone-200 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
            {/* Header Modal */}
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

            {/* Peringatan Pengembalian Stok */}
            <div className="p-2.5 bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 rounded-2xs space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                Stok Otomatis Dikembalikan:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-900/90">
                {(rejectModal.order.order_items || []).map((i, idx) => (
                  <li key={idx}>
                    {i.nama_produk} ({i.warna || "Default"},{" "}
                    {i.ukuran || "All Size"}) — <strong>+{i.qty} pcs</strong>{" "}
                    dikembalikan ke stok produk.
                  </li>
                ))}
              </ul>
            </div>

            {/* Pilihan Alasan Penolakan */}
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
                <option value="Lainnya">Alasan Lainnya</option>
              </select>
            </div>

            {/* Keterangan Tambahan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                Catatan Tambahan untuk Pembeli (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Tulis pesan jika ada penjelasan tambahan..."
                value={rejectModal.catatanTambahan}
                onChange={(e) =>
                  setRejectModal({
                    ...rejectModal,
                    catatanTambahan: e.target.value,
                  })
                }
                className="w-full bg-[#FAF8F5] border border-stone-300 p-2 text-xs text-neutral-900 rounded-2xs focus:bg-white focus:outline-none focus:border-amber-900"
              />
            </div>

            {/* Tombol Aksi */}
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
      )}

      {/* MODAL SUKSES VERIFIKASI */}
      {successModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSuccessModal(null)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-5 sm:p-7 space-y-4 text-center animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Pembayaran Disetujui!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pembayaran untuk pesanan{" "}
                <strong className="text-neutral-900 font-mono break-all">
                  {successModal.invoiceId}
                </strong>{" "}
                telah diverifikasi dan kas pemasukan otomatis tercatat di buku
                kas.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition shadow-xs rounded-2xs cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
