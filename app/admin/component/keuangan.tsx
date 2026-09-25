"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  X,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";
import ExportExcelModal from "./exportexcel";
import ExportPDFModal from "./exportpdf";

interface TransaksiKas {
  id: string | number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: "masuk" | "keluar";
  nominal: number;
  order_id?: number | string | null;
  isOrder?: boolean;
  rawDate?: string;
}

export default function KeuanganComponent() {
  const [transaksi, setTransaksi] = useState<TransaksiKas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState<"semua" | "masuk" | "keluar">(
    "semua",
  );
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransaksiKas | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Panggilan Modal
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const [formKas, setFormKas] = useState({
    keterangan: "",
    kategori: "Bahan Baku & Kain",
    tipe: "keluar" as "masuk" | "keluar",
    nominal: "",
  });

  const fetchCashFlowFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data: cashData } = await supabase
        .from("cash_flow")
        .select("*")
        .order("created_at", { ascending: false });

      const manualItems: TransaksiKas[] = (cashData || []).map((c: any) => ({
        id: c.id,
        tanggal:
          c.tanggal ||
          (c.created_at
            ? new Date(c.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Hari Ini"),
        keterangan: c.keterangan || "Catatan Kas",
        kategori: c.kategori || "Kas Umum",
        tipe: (c.tipe || "").toLowerCase().includes("masuk")
          ? "masuk"
          : "keluar",
        nominal: Number(c.nominal || 0),
        order_id: c.order_id || null,
        isOrder: false,
        rawDate: c.created_at || c.tanggal || new Date().toISOString(),
      }));

      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          "id, invoice_no, nama_pembeli, status, total, total_harga, created_at",
        )
        .order("created_at", { ascending: false });

      const paidStatuses = ["selesai", "diproses", "dikirim"];
      const paidOrders = (ordersData || []).filter((ord: any) =>
        paidStatuses.includes((ord.status || "").toLowerCase()),
      );
      const recordedOrderIds = new Set(
        manualItems.filter((m) => m.order_id).map((m) => String(m.order_id)),
      );

      const orderIncomeItems: TransaksiKas[] = paidOrders
        .filter((ord: any) => !recordedOrderIds.has(String(ord.id)))
        .map((ord: any) => ({
          id: "ord-" + ord.id,
          tanggal: ord.created_at
            ? new Date(ord.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Hari Ini",
          keterangan:
            "Pesanan " +
            (ord.invoice_no || "") +
            " - " +
            (ord.nama_pembeli || "Pelanggan"),
          kategori: "Penjualan Produk",
          tipe: "masuk",
          nominal: Number(ord.total || ord.total_harga || 0),
          order_id: ord.id,
          isOrder: true,
          rawDate: ord.created_at || new Date().toISOString(),
        }));

      const combined = [...manualItems, ...orderIncomeItems].sort(
        (a, b) =>
          new Date(b.rawDate || "").getTime() -
          new Date(a.rawDate || "").getTime(),
      );
      setTransaksi(combined);
    } catch (e) {
      console.error("Fetch Supabase Cash Flow Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowFromSupabase();
  }, []);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setFormKas((prev) => ({ ...prev, nominal: "" }));
      return;
    }
    const formatted = Number(rawVal).toLocaleString("id-ID");
    setFormKas((prev) => ({ ...prev, nominal: formatted }));
  };

  const handleAddTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKas.keterangan.trim() || !formKas.nominal) return;

    const nominalNum = Number(formKas.nominal.replace(/[^0-9]/g, ""));
    const tipePayload = formKas.tipe === "masuk" ? "Masuk" : "Keluar";
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    try {
      const { data, error } = await supabase
        .from("cash_flow")
        .insert([
          {
            keterangan: formKas.keterangan.trim(),
            kategori: formKas.kategori,
            tipe: tipePayload,
            nominal: nominalNum,
            tanggal: tanggalHariIni,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newKasItem: TransaksiKas = {
          id: data.id,
          tanggal: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          keterangan: data.keterangan,
          kategori: data.kategori,
          tipe: formKas.tipe,
          nominal: nominalNum,
          rawDate: new Date().toISOString(),
        };
        setTransaksi((prev) => [newKasItem, ...prev]);
      }

      setFormKas({
        keterangan: "",
        kategori: "Bahan Baku & Kain",
        tipe: "keluar",
        nominal: "",
      });
      setShowModal(false);
      setToastMessage("Transaksi kas berhasil dicatat ke buku keuangan toko.");
    } catch (err: any) {
      console.error("Error insert cash_flow to Supabase:", err);
      alert("Gagal mencatat kas: " + err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isOrder) {
      alert("Pesanan online otomatis tersinkron dengan menu Pesanan.");
      setDeleteTarget(null);
      return;
    }
    const targetId = deleteTarget.id;

    try {
      const { error } = await supabase
        .from("cash_flow")
        .delete()
        .eq("id", targetId);
      if (error) throw error;

      setTransaksi((prev) => prev.filter((t) => t.id !== targetId));
      setToastMessage("Catatan mutasi kas berhasil dihapus.");
    } catch (err: any) {
      console.error("Error delete cash_flow from Supabase:", err);
      alert("Gagal menghapus transaksi: " + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalMasuk = transaksi
    .filter((t) => t.tipe === "masuk")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.tipe === "keluar")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoBersih = totalMasuk - totalKeluar;

  const filteredTransaksi = transaksi.filter((t) => {
    if (filterTipe === "semua") return true;
    return t.tipe === filterTipe;
  });

  return (
    <div className="space-y-4 sm:space-y-5 w-full relative">
      {/* TOAST SUKSES TENGAH */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setToastMessage(null)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5] text-amber-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
                Pencatatan Berhasil
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                {toastMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-widest py-3 transition shadow-xs cursor-pointer active:scale-[0.99] rounded-2xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RINGKASAN KARTU KAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Total Pemasukan</span>
            </p>
            <h3 className="text-lg sm:text-xl font-bold font-mono text-neutral-950 mt-1 truncate">
              Rp {totalMasuk.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center rounded-full shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>Total Pengeluaran</span>
            </p>
            <h3 className="text-lg sm:text-xl font-bold font-mono text-neutral-950 mt-1 truncate">
              Rp {totalKeluar.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center rounded-full shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900/70">
              Saldo / Laba Bersih
            </p>
            <h3
              className={`text-lg sm:text-xl font-bold font-mono mt-1 truncate ${saldoBersih >= 0 ? "text-amber-950" : "text-rose-700"}`}
            >
              Rp {saldoBersih.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-950 text-amber-300 flex items-center justify-center rounded-full shrink-0 shadow-xs">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* FILTER, REFRESH & TOMBOL EKSPOR */}
      <div className="bg-white border border-stone-200 p-3.5 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xs rounded-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={fetchCashFlowFromSupabase}
            className="p-2 border border-stone-300 hover:border-neutral-900 bg-white hover:bg-stone-50 text-neutral-800 transition cursor-pointer rounded-2xs active:scale-95"
            title="Refresh Data Kas"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-900 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          {(["semua", "masuk", "keluar"] as const).map((tipe) => (
            <button
              key={tipe}
              type="button"
              onClick={() => setFilterTipe(tipe)}
              className={`text-[10px] sm:text-[11px] font-bold uppercase px-3 sm:px-4 py-2 border transition-all whitespace-nowrap cursor-pointer rounded-2xs ${
                filterTipe === tipe
                  ? "bg-neutral-950 text-amber-100 border-neutral-950 shadow-2xs"
                  : "bg-[#FAF8F5] text-neutral-600 border-stone-200 hover:border-stone-400 hover:bg-white"
              }`}
            >
              {tipe === "semua"
                ? "Semua Kas"
                : tipe === "masuk"
                  ? "Pemasukan (+)"
                  : "Pengeluaran (-)"}
            </button>
          ))}
        </div>

        {/* TOMBOL EKSPOR & TAMBAH */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowExcelModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition cursor-pointer shadow-2xs rounded-2xs"
            title="Ekspor Laporan Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPDFModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition cursor-pointer shadow-2xs rounded-2xs"
            title="Cetak Laporan PDF"
          >
            <Printer className="w-3.5 h-3.5 text-rose-700" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-4 py-2 transition shrink-0 active:scale-95 cursor-pointer shadow-2xs rounded-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Catat Kas</span>
          </button>
        </div>
      </div>

      {/* TAMPILAN MOBILE: KARTU MUTASI */}
      <div className="block md:hidden max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-3">
        {isLoading ? (
          <div className="bg-white border border-stone-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-2xs rounded-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-900" />
            <span className="text-xs font-semibold">Mengambil Buku Kas...</span>
          </div>
        ) : filteredTransaksi.length === 0 ? (
          <div className="bg-white border border-stone-200 p-6 text-center text-stone-400 text-xs shadow-2xs rounded-xs">
            Belum ada catatan mutasi kas di database.
          </div>
        ) : (
          filteredTransaksi.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 p-4 space-y-2.5 shadow-2xs rounded-xs"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {item.tanggal}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 border rounded-2xs ${
                    item.tipe === "masuk"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {item.tipe === "masuk" ? (
                    <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-rose-600" />
                  )}
                  <span>{item.tipe === "masuk" ? "Masuk" : "Keluar"}</span>
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-neutral-900 line-clamp-2 leading-relaxed">
                  {item.keterangan}
                </p>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[10px] font-semibold text-neutral-700 bg-[#FAF8F5] px-2 py-0.5 border border-stone-200 rounded-2xs">
                    {item.kategori}
                  </span>
                  <span
                    className={`font-bold font-mono text-xs ${item.tipe === "masuk" ? "text-emerald-800" : "text-rose-700"}`}
                  >
                    {item.tipe === "masuk" ? "+" : "-"} Rp{" "}
                    {item.nominal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {!item.isOrder && (
                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Catatan</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* TAMPILAN DESKTOP: TABEL SCROLL INDEPENDEN */}
      <div className="hidden md:block bg-white border border-stone-200 shadow-2xs rounded-xs overflow-hidden">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)]">
          <table className="w-full text-left text-xs min-w-[680px] border-collapse">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="p-3.5 pl-4 bg-[#FAF8F5]">Tanggal</th>
                <th className="p-3.5 bg-[#FAF8F5]">Keterangan Transaksi</th>
                <th className="p-3.5 bg-[#FAF8F5]">Kategori</th>
                <th className="p-3.5 bg-[#FAF8F5]">Jenis</th>
                <th className="p-3.5 text-right bg-[#FAF8F5]">Nominal</th>
                <th className="p-3.5 pr-4 text-center bg-[#FAF8F5]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5 text-amber-900" />
                    <span>Mengambil data kas dari database...</span>
                  </td>
                </tr>
              ) : filteredTransaksi.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-stone-400 text-xs"
                  >
                    Belum ada catatan mutasi kas di database.
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FCFAF7] transition-colors"
                  >
                    <td className="p-3.5 pl-4 text-stone-500 whitespace-nowrap font-mono">
                      {item.tanggal}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 max-w-sm">
                      {item.keterangan}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-neutral-700 bg-[#FAF8F5] px-2 py-0.5 border border-stone-200 rounded-2xs">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 border rounded-2xs ${
                          item.tipe === "masuk"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {item.tipe === "masuk" ? (
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        )}
                        <span>
                          {item.tipe === "masuk" ? "Masuk" : "Keluar"}
                        </span>
                      </span>
                    </td>
                    <td
                      className={`p-3.5 text-right font-bold font-mono whitespace-nowrap ${item.tipe === "masuk" ? "text-emerald-800" : "text-rose-700"}`}
                    >
                      {item.tipe === "masuk" ? "+" : "-"} Rp{" "}
                      {item.nominal.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 pr-4 text-center whitespace-nowrap">
                      {!item.isOrder ? (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xs transition cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">
                          Pesanan Web
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH KAS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-md bg-white border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-900" />
                <span>Catat Mutasi Kas Baru</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-stone-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaksi} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormKas({ ...formKas, tipe: "keluar" })}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition cursor-pointer rounded-2xs ${
                    formKas.tipe === "keluar"
                      ? "bg-rose-50 border-rose-400 text-rose-700 font-black shadow-2xs"
                      : "border-stone-200 text-neutral-500 hover:bg-stone-50"
                  }`}
                >
                  Kas Keluar (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormKas({ ...formKas, tipe: "masuk" })}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition cursor-pointer rounded-2xs ${
                    formKas.tipe === "masuk"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-black shadow-2xs"
                      : "border-stone-200 text-neutral-500 hover:bg-stone-50"
                  }`}
                >
                  Kas Masuk (+)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Keterangan <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Bahan Kain Rayon 2 Roll"
                  value={formKas.keterangan}
                  onChange={(e) =>
                    setFormKas({ ...formKas, keterangan: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-amber-900 focus:bg-white rounded-2xs transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Kategori Biaya <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formKas.kategori}
                  onChange={(e) =>
                    setFormKas({ ...formKas, kategori: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:border-amber-900 focus:bg-white cursor-pointer rounded-2xs transition-colors"
                >
                  <option value="Bahan Baku & Kain">Bahan Baku & Kain</option>
                  <option value="Jasa Jahit & Konveksi">
                    Jasa Jahit & Konveksi
                  </option>
                  <option value="Operasional & Packing">
                    Operasional & Packing
                  </option>
                  <option value="Penjualan Web">Penjualan Web</option>
                  <option value="Penjualan Offline / WA">
                    Penjualan Offline / WA
                  </option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Nominal (Rp) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 350.000"
                    value={formKas.nominal}
                    onChange={handleNominalChange}
                    className="w-full bg-[#FAF8F5] border border-stone-300 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-900 focus:bg-white font-bold font-mono rounded-2xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white border border-stone-300 hover:bg-stone-50 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-2.5 transition text-center cursor-pointer rounded-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-2.5 transition text-center shadow-xs cursor-pointer rounded-2xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 bg-white p-5 sm:p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Catatan Kas?
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Catatan mutasi{" "}
                <strong className="text-neutral-900">
                  "{deleteTarget.keterangan}"
                </strong>{" "}
                akan dihapus permanen dari buku kas toko.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase py-2 transition cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold uppercase py-2 transition shadow-xs cursor-pointer rounded-2xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EKSPOR EXCEL & PDF */}
      <ExportExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        data={filteredTransaksi}
        filterTipe={filterTipe}
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
        saldoBersih={saldoBersih}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      <ExportPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        data={filteredTransaksi}
        filterTipe={filterTipe}
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
        saldoBersih={saldoBersih}
        onSuccess={(msg) => setToastMessage(msg)}
      />
    </div>
  );
}
