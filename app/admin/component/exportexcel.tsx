"use client";

import React from "react";
import { X, FileSpreadsheet, Download } from "lucide-react";

interface TransaksiKas {
  id: string | number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: "masuk" | "keluar";
  nominal: number;
  rawDate?: string;
}

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransaksiKas[];
  filterTipe: string;
  totalMasuk: number;
  totalKeluar: number;
  saldoBersih: number;
  onSuccess: (msg: string) => void;
}

const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const formatTanggalStandar = (tglStr?: string, rawDate?: string): string => {
  const dateToParse = rawDate || tglStr;
  if (!dateToParse) return "-";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateToParse)) return dateToParse;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateToParse)) {
    const parts = dateToParse.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const d = new Date(dateToParse);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return dateToParse;
};

export default function ExportExcelModal({
  isOpen,
  onClose,
  data,
  filterTipe,
  totalMasuk,
  totalKeluar,
  saldoBersih,
  onSuccess,
}: ExportExcelModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (data.length === 0) {
      alert("Tidak ada data yang bisa diekspor.");
      return;
    }

    const rowsHtml = data
      .map((item, idx) => {
        const tanggalBaku = formatTanggalStandar(item.tanggal, item.rawDate);
        const cleanKeterangan = escapeXml(item.keterangan || "-");
        const cleanKategori = escapeXml(item.kategori || "Umum");

        return `
        <tr height="24">
          <td align="center" style="border:1px solid #d4d4d4; vertical-align:middle; mso-number-format:'\\@';">${idx + 1}</td>
          <td align="center" style="border:1px solid #d4d4d4; vertical-align:middle; mso-number-format:'\\@'; font-family:Consolas, monospace;">${tanggalBaku}</td>
          <td align="left" style="border:1px solid #d4d4d4; vertical-align:middle; padding-left:8px; padding-right:8px; mso-number-format:'\\@';">${cleanKeterangan}</td>
          <td align="center" style="border:1px solid #d4d4d4; vertical-align:middle; mso-number-format:'\\@';">${cleanKategori}</td>
          <td align="center" style="border:1px solid #d4d4d4; vertical-align:middle; font-weight:bold; color:${item.tipe === "masuk" ? "#047857" : "#be123c"}; background-color:${item.tipe === "masuk" ? "#ecfdf5" : "#fff1f2"}; mso-number-format:'\\@';">
            ${item.tipe === "masuk" ? "MASUK" : "KELUAR"}
          </td>
          <td align="right" style="border:1px solid #d4d4d4; vertical-align:middle; padding-right:8px; font-weight:bold; font-family:Consolas, monospace; mso-number-format:'\\#\\,\\#\\#0';">
            ${item.nominal}
          </td>
        </tr>
      `;
      })
      .join("");

    const templateExcel = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Laporan Kas</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
            th { font-size: 10pt; text-transform: uppercase; font-weight: bold; }
            td { font-size: 10pt; }
          </style>
        </head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0">
            <col width="50" />
            <col width="115" />
            <col width="380" />
            <col width="160" />
            <col width="95" />
            <col width="140" />

            <!-- KOP TOKO -->
            <tr height="32">
              <td colspan="6" align="center" style="font-size:14pt; font-weight:bold; vertical-align:middle;">
                LAPORAN KAS ALMACO FASHION
              </td>
            </tr>
            <tr height="18">
              <td colspan="6" align="center" style="font-size:9pt; color:#666666; vertical-align:middle;">
                Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} | Filter: ${filterTipe.toUpperCase()}
              </td>
            </tr>
            <tr height="12"><td colspan="6"></td></tr>

            <!-- RINGKASAN SALDO -->
            <tr height="22">
              <td colspan="4" align="left" style="border:1px solid #bfbfbf; background-color:#f8f8f8; padding-left:8px; font-weight:bold;">Total Pemasukan</td>
              <td colspan="2" align="right" style="border:1px solid #bfbfbf; padding-right:8px; font-weight:bold; color:#047857; mso-number-format:'\\#\\,\\#\\#0';">${totalMasuk}</td>
            </tr>
            <tr height="22">
              <td colspan="4" align="left" style="border:1px solid #bfbfbf; background-color:#f8f8f8; padding-left:8px; font-weight:bold;">Total Pengeluaran</td>
              <td colspan="2" align="right" style="border:1px solid #bfbfbf; padding-right:8px; font-weight:bold; color:#be123c; mso-number-format:'\\#\\,\\#\\#0';">${totalKeluar}</td>
            </tr>
            <tr height="24">
              <td colspan="4" align="left" style="border:1px solid #737373; background-color:#e5e5e5; padding-left:8px; font-weight:bold;">Saldo Bersih</td>
              <td colspan="2" align="right" style="border:1px solid #737373; background-color:#e5e5e5; padding-right:8px; font-weight:bold; color:#171717; mso-number-format:'\\#\\,\\#\\#0';">${saldoBersih}</td>
            </tr>
            <tr height="14"><td colspan="6"></td></tr>

            <!-- HEADER TABEL -->
            <tr height="28">
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">No</th>
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">Tanggal</th>
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">Keterangan Transaksi / No. Invoice</th>
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">Kategori</th>
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">Jenis</th>
              <th align="center" style="background-color:#171717; color:#ffffff; border:1px solid #171717; vertical-align:middle;">Nominal (Rp)</th>
            </tr>

            <!-- ISI DATA -->
            ${rowsHtml}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([templateExcel], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Kas_Almaco_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
    onSuccess("Laporan kas format Excel (.xls) berhasil diunduh.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white border border-neutral-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Ekspor Laporan Excel
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Format rapi & presisi Microsoft Excel (.xls)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-2 text-xs rounded-2xs">
          <div className="flex justify-between">
            <span className="text-neutral-500">Filter Aktif:</span>
            <span className="font-bold uppercase text-neutral-900">
              {filterTipe}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Jumlah Transaksi:</span>
            <span className="font-bold text-neutral-900">
              {data.length} baris
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-semibold">
            <span className="text-neutral-600">Saldo Akhir:</span>
            <span
              className={
                saldoBersih >= 0
                  ? "text-neutral-900 font-bold"
                  : "text-rose-600 font-bold"
              }
            >
              Rp {saldoBersih.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider py-2.5 transition cursor-pointer rounded-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer rounded-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
