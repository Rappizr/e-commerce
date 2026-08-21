'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-react';
import { useKeranjang } from '../../penyimpanan/KeranjangContext';

interface DashboardProps {
  onNavigate?: (menu: 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan') => void;
}

export default function DashboardComponent({ onNavigate }: DashboardProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const { pesananList } = useKeranjang();

  const totalPendapatan = pesananList.reduce((acc: number, p: any) => acc + (p.status !== 'Dibatalkan' ? (p.total || 0) : 0), 0);
  const perluVerifikasiCount = pesananList.filter((p: any) => p.status === 'Menunggu Verifikasi').length;
  const totalPesananCount = pesananList.length;

  const chartPoints = [
    { day: 'Sen', total: 0, x: 30, y: 170 },
    { day: 'Sel', total: 0, x: 110, y: 170 },
    { day: 'Rab', total: 0, x: 190, y: 170 },
    { day: 'Kam', total: 0, x: 270, y: 170 },
    { day: 'Jum', total: 0, x: 350, y: 170 },
    { day: 'Sab', total: 0, x: 430, y: 170 },
    { day: 'Min', total: totalPendapatan, x: 510, y: totalPendapatan > 0 ? 40 : 170 },
  ];

  const curvePath = totalPendapatan > 0 
    ? "M 30,170 C 110,170 190,170 270,170 C 350,170 430,170 510,40"
    : "M 30,170 L 510,170";
  const fillPath = `${curvePath} L 510,180 L 30,180 Z`;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Total Pendapatan</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">Rp {totalPendapatan.toLocaleString('id-ID')}</h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-full shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Perlu Verifikasi</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">{perluVerifikasiCount} Pesanan</h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center rounded-full shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Total Pesanan</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">{totalPesananCount} Transaksi</h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center rounded-full shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Produk Aktif</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">8 Busana</h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center rounded-full shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8 bg-white border border-neutral-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-neutral-900 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                  Tren Penjualan 7 Hari
                </h3>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate">Ketuk titik grafik untuk melihat rincian omzet</p>
              </div>
            </div>
            {activePoint !== null && (
              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 block">
                  {chartPoints[activePoint].day}:
                </span>
                <span className="text-[11px] sm:text-xs font-black text-neutral-950">
                  Rp {chartPoints[activePoint].total.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          <div className="relative w-full aspect-[16/9] sm:aspect-[24/9]">
            <svg viewBox="0 0 540 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#18181b" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              <line x1="20" y1="30" x2="520" y2="30" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="80" x2="520" y2="80" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="130" x2="520" y2="130" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="180" x2="520" y2="180" stroke="#e5e5e5" strokeWidth="1" />

              <path d={fillPath} fill="url(#chartGradient)" />
              <path d={curvePath} fill="none" stroke="#18181b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {chartPoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer" onClick={() => setActivePoint(idx)} onMouseEnter={() => setActivePoint(idx)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activePoint === idx ? "7" : "4.5"}
                    className={`transition-all duration-200 ${
                      activePoint === idx 
                        ? "fill-neutral-950 stroke-white stroke-2" 
                        : "fill-white stroke-neutral-900 stroke-2 hover:fill-neutral-900"
                    }`}
                  />
                  <text
                    x={pt.x}
                    y="196"
                    textAnchor="middle"
                    className={`text-[10px] font-bold uppercase transition-colors ${
                      activePoint === idx ? "fill-neutral-950" : "fill-neutral-400"
                    }`}
                  >
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-neutral-200 p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 sm:pb-4">
              Ringkasan Arus Kas
            </h3>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-emerald-700 mb-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Kas Masuk</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-emerald-950">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
              </div>

              <div className="p-3 sm:p-3.5 bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-rose-700 mb-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-rose-950">Rp 0</p>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] sm:text-xs">Laba Bersih</span>
            <span className="font-bold text-neutral-950 text-xs sm:text-sm">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Verifikasi Pembayaran</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">Ada bukti transfer pelanggan yang menunggu persetujuan Anda.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pembayaran')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Buka Konfirmasi Bayar →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Buku Keuangan</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">Catat modal kain, biaya operasional konveksi, dan laba bersih.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Kelola Buku Kas →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Katalog Busana</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">Perbarui stok daster, gamis, setcel, atau tambahkan produk baru.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('produk')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Buka Katalog Produk →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}