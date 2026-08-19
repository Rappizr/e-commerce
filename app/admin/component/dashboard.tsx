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

interface DashboardProps {
  onNavigate?: (menu: 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan') => void;
}

export default function DashboardComponent({ onNavigate }: DashboardProps) {
  const [activePoint, setActivePoint] = useState<number | null>(4); // Default pilih hari Jumat

  const chartPoints = [
    { day: 'Sen', total: 1200000, x: 30, y: 130 },
    { day: 'Sel', total: 1850000, x: 110, y: 95 },
    { day: 'Rab', total: 950000,  x: 190, y: 145 },
    { day: 'Kam', total: 2400000, x: 270, y: 60 },
    { day: 'Jum', total: 3100000, x: 350, y: 20 },
    { day: 'Sab', total: 2100000, x: 430, y: 80 },
    { day: 'Min', total: 1500000, x: 510, y: 115 },
  ];

  // Path kurva bezier halus
  const curvePath = "M 30,130 C 70,110 80,95 110,95 C 140,95 160,145 190,145 C 220,145 240,60 270,60 C 300,60 320,20 350,20 C 380,20 400,80 430,80 C 460,80 480,115 510,115";
  const fillPath = `${curvePath} L 510,180 L 30,180 Z`;

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Pendapatan</p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">Rp 12.450.000</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-full">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Perlu Verifikasi</p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">3 Pembayaran</h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center rounded-full">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Pesanan</p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">84 Transaksi</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center rounded-full">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Produk Aktif</p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">24 Busana</h3>
          </div>
          <div className="w-10 h-10 bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center rounded-full">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Baris Grafik Garis & Arus Kas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Grafik Garis & Area SVG */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-900" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Tren Penjualan 7 Hari Terakhir
                </h3>
                <p className="text-[10px] text-neutral-400">Arahkan kursor ke titik grafik untuk melihat rincian omzet harian</p>
              </div>
            </div>
            {activePoint !== null && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  {chartPoints[activePoint].day}:
                </span>
                <span className="text-xs font-black text-neutral-950">
                  Rp {chartPoints[activePoint].total.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {/* Area Render Grafik SVG */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9]">
            <svg viewBox="0 0 540 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#18181b" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Garis Grid Horizontal */}
              <line x1="20" y1="30" x2="520" y2="30" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="80" x2="520" y2="80" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="130" x2="520" y2="130" stroke="#f1f1f1" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="180" x2="520" y2="180" stroke="#e5e5e5" strokeWidth="1" />

              {/* Area Shading Gradien */}
              <path d={fillPath} fill="url(#chartGradient)" />

              {/* Garis Kurva Utama */}
              <path d={curvePath} fill="none" stroke="#18181b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Titik Interaktif (Data Points) */}
              {chartPoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(idx)}>
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
                  {/* Label Hari Bawah */}
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

        {/* Kolom Ringkasan Arus Kas */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4">
              Ringkasan Arus Kas
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 mb-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Kas Masuk (Penjualan)</span>
                </div>
                <p className="text-base font-bold text-emerald-950">Rp 12.450.000</p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-700 mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar (Kain & Ekspedisi)</span>
                </div>
                <p className="text-base font-bold text-rose-950">Rp 4.120.000</p>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-500 uppercase tracking-wider">Laba Bersih</span>
            <span className="font-bold text-neutral-950 text-sm">Rp 8.330.000</span>
          </div>
        </div>

      </div>

      {/* Pintasan Aksi Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Verifikasi Pembayaran</h4>
          <p className="text-xs text-neutral-500">Ada bukti transfer pelanggan yang menunggu persetujuan Anda.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pembayaran')}
              className="text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Buka Konfirmasi Bayar →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Buku Keuangan</h4>
          <p className="text-xs text-neutral-500">Catat modal kain, biaya operasional konveksi, dan laba bersih.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Kelola Buku Kas →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Katalog Busana</h4>
          <p className="text-xs text-neutral-500">Perbarui stok daster, gamis, setcel, atau tambahkan produk baru.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('produk')}
              className="text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block"
            >
              Buka Katalog Produk →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}