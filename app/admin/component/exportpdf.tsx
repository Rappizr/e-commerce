'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';

interface TransaksiKas {
  id: string | number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: 'masuk' | 'keluar';
  nominal: number;
  rawDate?: string;
}

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransaksiKas[];
  filterTipe: string;
  totalMasuk: number;
  totalKeluar: number;
  saldoBersih: number;
  onSuccess: (msg: string) => void;
}

const formatTanggalStandar = (tglStr?: string, rawDate?: string): string => {
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  if (tglStr) {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(tglStr)) return tglStr;
    if (/^\d{4}-\d{2}-\d{2}/.test(tglStr)) {
      const parts = tglStr.split('T')[0].split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parsed = new Date(tglStr);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return tglStr || '-';
};

export default function ExportPDFModal({
  isOpen,
  onClose,
  data,
  filterTipe,
  totalMasuk,
  totalKeluar,
  saldoBersih,
  onSuccess,
}: ExportPDFModalProps) {
  if (!isOpen) return null;

  const handlePrintPDF = () => {
    if (data.length === 0) {
      alert('Tidak ada data yang bisa dicetak.');
      return;
    }

    const rowsHtml = data.map((item, idx) => {
      const tanggalBaku = formatTanggalStandar(item.tanggal, item.rawDate);
      const bgZebra = idx % 2 === 1 ? '#fafafa' : '#ffffff';
      return `
        <tr style="background-color: ${bgZebra};">
          <td style="text-align: center; padding: 7px 5px; border: 1px solid #d4d4d4;">${idx + 1}</td>
          <td style="text-align: center; padding: 7px 5px; border: 1px solid #d4d4d4; white-space: nowrap; font-family: monospace;">${tanggalBaku}</td>
          <td style="padding: 7px 8px; border: 1px solid #d4d4d4; font-weight: 600;">${item.keterangan}</td>
          <td style="text-align: center; padding: 7px 5px; border: 1px solid #d4d4d4;">${item.kategori}</td>
          <td style="text-align: center; padding: 7px 5px; border: 1px solid #d4d4d4; font-weight: bold; color: ${item.tipe === 'masuk' ? '#047857' : '#be123c'};">
            ${item.tipe === 'masuk' ? 'Masuk' : 'Keluar'}
          </td>
          <td style="text-align: right; padding: 7px 8px; border: 1px solid #d4d4d4; font-weight: bold; white-space: nowrap;">
            Rp ${item.nominal.toLocaleString('id-ID')}
          </td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up terblokir browser. Izinkan pop-up untuk mencetak PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Kas ALMACO FASHION</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
              color: #171717; 
              margin: 0; 
              padding: 10px; 
            }
            .kop { 
              border-bottom: 2px solid #171717; 
              padding-bottom: 12px; 
              margin-bottom: 16px; 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
            }
            .brand { 
              font-size: 20px; 
              font-weight: 900; 
              letter-spacing: 1px; 
              text-transform: uppercase; 
            }
            .brand span { 
              font-weight: 300; 
              color: #737373; 
            }
            .sub { 
              font-size: 9px; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              color: #737373; 
              margin-top: 2px; 
            }
            .info-cetak { 
              font-size: 10px; 
              color: #525252; 
              text-align: right; 
            }
            .summary-cards { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 10px; 
              margin-bottom: 18px; 
            }
            .card { 
              border: 1px solid #d4d4d4; 
              padding: 10px; 
              background: #fafafa; 
            }
            .card-label { 
              font-size: 9px; 
              text-transform: uppercase; 
              font-weight: bold; 
              letter-spacing: 0.5px; 
              color: #737373; 
            }
            .card-val { 
              font-size: 14px; 
              font-weight: bold; 
              margin-top: 3px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 10px; 
              margin-top: 8px; 
              border: 1px solid #d4d4d4;
            }
            th { 
              background-color: #171717 !important; 
              color: #ffffff !important; 
              text-transform: uppercase; 
              font-size: 9px; 
              padding: 8px 6px; 
              letter-spacing: 0.5px; 
              border: 1px solid #171717;
            }
            td {
              border: 1px solid #d4d4d4;
            }
            @media print { 
              body { padding: 0; } 
            }
          </style>
        </head>
        <body>
          <div class="kop">
            <div>
              <div class="brand">ALMACO <span>FASHION</span></div>
              <div class="sub">Laporan Buku Kas & Keuangan Toko</div>
            </div>
            <div class="info-cetak">
              <div>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div>Filter Kas: <strong>${filterTipe.toUpperCase()}</strong></div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label" style="color: #047857;">Total Pemasukan</div>
              <div class="card-val" style="color: #047857;">Rp ${totalMasuk.toLocaleString('id-ID')}</div>
            </div>
            <div class="card">
              <div class="card-label" style="color: #be123c;">Total Pengeluaran</div>
              <div class="card-val" style="color: #be123c;">Rp ${totalKeluar.toLocaleString('id-ID')}</div>
            </div>
            <div class="card" style="background-color: #f5f5f5; border-color: #171717;">
              <div class="card-label">Saldo / Laba Bersih</div>
              <div class="card-val" style="color: #171717;">Rp ${saldoBersih.toLocaleString('id-ID')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 14%; text-align: center;">Tanggal</th>
                <th style="width: 41%; text-align: left; padding-left: 8px;">Keterangan Transaksi</th>
                <th style="width: 15%; text-align: center;">Kategori</th>
                <th style="width: 10%; text-align: center;">Jenis</th>
                <th style="width: 15%; text-align: right; padding-right: 8px;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    onClose();
    onSuccess('Jendela cetak PDF berhasil dibuka.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white border border-neutral-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Cetak Dokumen PDF
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">Format A4 Resmi (Tabel Bergaris Penuh)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-500">Filter Aktif:</span>
            <span className="font-bold uppercase text-neutral-900">{filterTipe}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Jumlah Transaksi:</span>
            <span className="font-bold text-neutral-900">{data.length} baris</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-semibold">
            <span className="text-neutral-600">Saldo Akhir:</span>
            <span className={saldoBersih >= 0 ? 'text-neutral-900 font-bold' : 'text-rose-600 font-bold'}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider py-2.5 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePrintPDF}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Buka & Cetak PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}