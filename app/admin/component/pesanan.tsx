"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  Truck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  PackageCheck,
  Trash2,
  AlertTriangle,
  Printer,
  Barcode,
  X,
  Clock,
  Filter,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";
import { cetakLabelPacking, OrderRecordResi } from "./resi";

export default function PesananComponent() {
  const [orders, setOrders] = useState<OrderRecordResi[]>([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Input Resi per pesanan
  const [resiInputs, setResiInputs] = useState<{
    [key: number]: { no_resi: string; kurir: string };
  }>({});
  const [isSavingResi, setIsSavingResi] = useState<{ [key: number]: boolean }>(
    {},
  );

  // State Modal Konfirmasi Update Status
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    targetStatus: string;
    actionLabel: string;
  }>({
    show: false,
    orderId: null,
    invoiceNo: "",
    targetStatus: "",
    actionLabel: "",
  });

  // State Modal Konfirmasi Hapus Pesanan
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    isDeleting: boolean;
  }>({
    show: false,
    orderId: null,
    invoiceNo: "",
    isDeleting: false,
  });

  const fetchOrders = async () => {
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
          alamat_lengkap,
          status,
          subtotal,
          ongkir,
          total,
          total_harga,
          no_resi,
          kurir,
          created_at,
          order_items (
            id,
            nama_produk,
            qty,
            warna,
            ukuran,
            harga,
            subtotal
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderRecordResi[]);
        const initialResi: {
          [key: number]: { no_resi: string; kurir: string };
        } = {};
        data.forEach((o: any) => {
          initialResi[o.id] = {
            no_resi: o.no_resi || "",
            kurir: (o.kurir || "").trim(),
          };
        });
        setResiInputs(initialResi);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openStatusModal = (
    orderId: number,
    invoiceNo: string,
    targetStatus: string,
    actionLabel: string,
  ) => {
    setStatusModal({
      show: true,
      orderId,
      invoiceNo,
      targetStatus,
      actionLabel,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModal.orderId) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: statusModal.targetStatus })
        .eq("id", statusModal.orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === statusModal.orderId
              ? { ...o, status: statusModal.targetStatus }
              : o,
          ),
        );
      }
    } catch (err) {
      console.error("Gagal update status pesanan:", err);
    } finally {
      setStatusModal({
        show: false,
        orderId: null,
        invoiceNo: "",
        targetStatus: "",
        actionLabel: "",
      });
    }
  };

  const handleSimpanResi = async (orderId: number) => {
    const dataResi = resiInputs[orderId];
    if (!dataResi?.no_resi.trim()) {
      alert("Mohon masukkan nomor resi pengiriman terlebih dahulu.");
      return;
    }

    const orderTarget = orders.find((o) => o.id === orderId);
    const kurirFinal = (
      orderTarget?.kurir ||
      dataResi.kurir ||
      "REGULER"
    ).trim();

    setIsSavingResi((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          no_resi: dataResi.no_resi.trim().toUpperCase(),
          kurir: kurirFinal,
          status: "Dikirim",
        })
        .eq("id", orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  no_resi: dataResi.no_resi.trim().toUpperCase(),
                  kurir: kurirFinal,
                  status: "Dikirim",
                }
              : o,
          ),
        );
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error("Gagal simpan resi:", err);
      alert("Gagal memperbarui nomor resi: " + err.message);
    } finally {
      setIsSavingResi((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.orderId) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", deleteModal.orderId);
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", deleteModal.orderId);

      if (!error) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      }
    } catch (err) {
      console.error("Gagal menghapus pesanan:", err);
    } finally {
      setDeleteModal({
        show: false,
        orderId: null,
        invoiceNo: "",
        isDeleting: false,
      });
    }
  };

  const generateWaUrl = (item: OrderRecordResi) => {
    const rawWa = item.no_hp ? String(item.no_hp).replace(/[^0-9]/g, "") : "";
    const phone = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : rawWa;

    const itemsSummary = (item.order_items || [])
      .map(
        (i) =>
          `• ${i.nama_produk} (${i.ukuran || "All Size"}, ${i.warna || "Default"}) x${i.qty}`,
      )
      .join("\n");

    const kurirAktif = (item.kurir || "Ekspedisi").toUpperCase();
    const noResiAktif = item.no_resi || resiInputs[item.id]?.no_resi;

    const resiPart = noResiAktif
      ? `\n📦 *Kurir:* ${kurirAktif}\n🔖 *No. Resi:* ${noResiAktif}`
      : "";

    const textMessage = `Halo Kak *${item.nama_pembeli}*,

Terima kasih telah berbelanja di *ALMACO Official*.

Berikut rincian pesanan Anda:
*No. Invoice:* ${item.invoice_no}

*Detail Produk:*
${itemsSummary}

*Total Tagihan:* Rp ${Number(item.total || item.total_harga || 0).toLocaleString("id-ID")}
*Status Pesanan:* ${item.status}${resiPart}

Ada yang bisa kami bantu terkait pesanan ini Kak? Terima kasih.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`;
  };

  const filterTabs = [
    { label: "Semua", value: "Semua" },
    { label: "Menunggu Verifikasi", value: "Menunggu Verifikasi" },
    { label: "Diproses", value: "Diproses" },
    { label: "Dikirim", value: "Dikirim" },
    { label: "Selesai", value: "Selesai" },
  ];

  const getFilteredCount = (val: string) => {
    if (val === "Semua") return orders.length;
    if (val === "Menunggu Verifikasi") {
      return orders.filter(
        (o) =>
          o.status === "Menunggu Verifikasi" ||
          o.status === "Menunggu Pembayaran",
      ).length;
    }
    return orders.filter((o) => o.status === val).length;
  };

  const filtered = orders.filter((item) => {
    let matchStatus = true;
    if (filterStatus === "Menunggu Verifikasi") {
      matchStatus =
        item.status === "Menunggu Verifikasi" ||
        item.status === "Menunggu Pembayaran";
    } else if (filterStatus !== "Semua") {
      matchStatus = item.status === filterStatus;
    }

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.invoice_no?.toLowerCase().includes(q) ||
      item.nama_pembeli?.toLowerCase().includes(q) ||
      item.no_hp?.toLowerCase().includes(q) ||
      item.no_resi?.toLowerCase().includes(q) ||
      item.kurir?.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const renderStatusBadge = (status: string) => {
    if (status === "Menunggu Verifikasi" || status === "Menunggu Pembayaran") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-amber-50 text-amber-900 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-700" />
          <span>{status}</span>
        </span>
      );
    }
    if (status === "Diproses") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-blue-50 text-blue-800 border border-blue-200">
          <PackageCheck className="w-3 h-3 text-blue-600" />
          <span>Diproses</span>
        </span>
      );
    }
    if (status === "Dikirim") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-purple-50 text-purple-800 border border-purple-200">
          <Truck className="w-3 h-3 text-purple-600" />
          <span>Dikirim</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Selesai</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      {/* HEADER & FILTER TETAP DIAM (TIDAK IKUT TER-SCROLL) */}
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
              Pantau pembayaran masuk, cetak label resi packing, input nomor
              resi ekspedisi, dan koordinasi pelanggan.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:border-neutral-900 bg-white hover:bg-stone-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer active:scale-95"
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
            placeholder="Cari No. Invoice, Nama Pembeli, No. WhatsApp, Ekspedisi, atau No. Resi..."
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

      {/* TAMPILAN MOBILE DENGAN SCROLL KHUSUS KARTU */}
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
            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 p-4 space-y-3 shadow-2xs rounded-xs"
              >
                <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs text-neutral-950 block">
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
                    <span className="font-bold text-neutral-900">
                      {item.nama_pembeli}
                    </span>
                    <a
                      href={generateWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-200 rounded-2xs transition"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>Chat WA</span>
                    </a>
                  </div>

                  <div className="space-y-0.5 pt-1 bg-[#FAF8F5] p-2 border border-stone-200/80 rounded-2xs">
                    {(item.order_items || []).map((prod) => (
                      <p
                        key={prod.id}
                        className="text-[11px] text-neutral-800 line-clamp-1"
                      >
                        • {prod.nama_produk} ({prod.ukuran || "All Size"},{" "}
                        {prod.warna || "Default"}){" "}
                        <span className="font-bold font-mono">x{prod.qty}</span>
                      </p>
                    ))}
                  </div>

                  <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                    📍 {item.alamat_lengkap}
                  </p>

                  <div className="mt-1.5 p-2 bg-stone-50 border border-stone-200 text-[10px] flex items-center justify-between rounded-2xs">
                    <span className="font-bold uppercase text-neutral-700">
                      Kurir: {kurirAktif}
                    </span>
                    <span className="font-mono font-bold text-amber-950 flex items-center gap-1">
                      <Barcode className="w-3 h-3 text-stone-500" />
                      {item.no_resi || "Belum Ada Resi"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                    <span className="text-neutral-500 text-[11px]">
                      Total Tagihan:
                    </span>
                    <span className="font-bold text-amber-950 font-mono text-xs sm:text-sm">
                      Rp{" "}
                      {Number(
                        item.total || item.total_harga || 0,
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      cetakLabelPacking(
                        item,
                        resiInputs[item.id]?.no_resi,
                        item.kurir || "",
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

                  {(item.status === "Menunggu Verifikasi" ||
                    item.status === "Menunggu Pembayaran") && (
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
                      Verifikasi Pembayaran
                    </button>
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
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold uppercase inline-flex items-center justify-center gap-1.5 transition shadow-2xs text-center cursor-pointer rounded-2xs"
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

      {/* TAMPILAN DESKTOP DENGAN SCROLL MANDIRI & STICKY HEADER */}
      <div className="hidden lg:block flex-1 bg-white border border-stone-200 shadow-2xs rounded-xs overflow-hidden">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)]">
          <table className="w-full text-left text-xs min-w-[980px] border-collapse">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500 sticky top-0 z-20 shadow-xs">
              <tr>
                <th className="p-3.5 pl-4 bg-[#FAF8F5]">Invoice & Tanggal</th>
                <th className="p-3.5 bg-[#FAF8F5]">Pembeli & Kontak</th>
                <th className="p-3.5 max-w-[280px] bg-[#FAF8F5]">
                  Rincian Item & Alamat
                </th>
                <th className="p-3.5 bg-[#FAF8F5]">Ekspedisi & Resi</th>
                <th className="p-3.5 bg-[#FAF8F5]">Total Tagihan</th>
                <th className="p-3.5 bg-[#FAF8F5]">Status</th>
                <th className="p-3.5 pr-4 text-center bg-[#FAF8F5]">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-900" />
                    <span className="text-xs">Memuat daftar pesanan...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-stone-400 text-xs"
                  >
                    Tidak ada transaksi yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const kurirAktif = (item.kurir || "REGULER").toUpperCase();
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FCFAF7] transition-colors"
                    >
                      <td className="p-3.5 pl-4 whitespace-nowrap align-top">
                        <span className="font-bold text-neutral-950 font-mono block">
                          {item.invoice_no}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap align-top">
                        <span className="font-bold block text-neutral-900">
                          {item.nama_pembeli}
                        </span>
                        <a
                          href={generateWaUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-200 rounded-2xs transition mt-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>+{item.no_hp}</span>
                        </a>
                      </td>

                      <td className="p-3.5 max-w-[280px] align-top">
                        <div className="space-y-0.5">
                          {(item.order_items || []).map((prod) => (
                            <p
                              key={prod.id}
                              className="text-neutral-900 truncate text-[11px]"
                            >
                              • {prod.nama_produk} ({prod.ukuran || "All Size"},{" "}
                              {prod.warna || "Default"}){" "}
                              <strong className="font-mono">x{prod.qty}</strong>
                            </p>
                          ))}
                        </div>
                        <p
                          className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed"
                          title={item.alamat_lengkap}
                        >
                          📍 {item.alamat_lengkap}
                        </p>
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
                                  resiInputs[item.id]?.no_resi,
                                  item.kurir || "",
                                )
                              }
                              className="px-2.5 py-1 bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 hover:bg-stone-50 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer shadow-2xs rounded-2xs"
                              title="Cetak Label Packing Pengiriman"
                            >
                              <Printer className="w-3 h-3 text-stone-600" />
                              <span>Label</span>
                            </button>

                            {(item.status === "Menunggu Verifikasi" ||
                              item.status === "Menunggu Pembayaran") && (
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
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Truck className="w-3 h-3 text-amber-300" />
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

      {/* MODAL KONFIRMASI STATUS */}
      {statusModal.show && (
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
                <strong className="font-mono text-neutral-900">
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
      )}

      {/* MODAL HAPUS PESANAN */}
      {deleteModal.show && (
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
                <strong className="font-mono text-neutral-900">
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
      )}
    </div>
  );
}
