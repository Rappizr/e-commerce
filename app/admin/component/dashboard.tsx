'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface DashboardProps {
  onNavigate?: (menu: 'pesanan' | 'produk' | 'pembayaran' | 'testimoni' | 'keuangan') => void;
}

interface ChartPoint {
  day: string;
  dateKey: string;
  total: number;
  x: number;
  y: number;
}

export default function DashboardComponent({ onNavigate }: DashboardProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Statistik dari Katalog
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [perluVerifikasiCount, setPerluVerifikasiCount] = useState(0);
  const [totalPesananCount, setTotalPesananCount] = useState(0);
  const [totalProdukCount, setTotalProdukCount] = useState(0);
  const [totalKasKeluar, setTotalKasKeluar] = useState(0);

  // State Data Chart 7 Hari
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [curvePath, setCurvePath] = useState("M 30,170 L 510,170");
  const [fillPath, setFillPath] = useState("M 30,170 L 510,170 L 510,180 L 30,180 Z");

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil data pesanan (orders)
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('id, status, total, total_harga, created_at');

      if (ordersErr) throw ordersErr;

      const orders = ordersData || [];
      const nonCanceled = orders.filter((o: any) => o.status !== 'Dibatalkan');
      
      const pendapatan = nonCanceled.reduce(
        (acc: number, o: any) => acc + Number(o.total || o.total_harga || 0), 
        0
      );
      const pendingVerif = orders.filter(
        (o: any) => o.status === 'Menunggu Verifikasi' || o.status === 'Menunggu Pembayaran'
      ).length;

      setTotalPendapatan(pendapatan);
      setPerluVerifikasiCount(pendingVerif);
      setTotalPesananCount(orders.length);

      // 2. Ambil jumlah produk aktif (products)
      const { count: productCount, error: productErr } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (!productErr && productCount !== null) {
        setTotalProdukCount(productCount);
      }

      // 3. Ambil pengeluaran dari arus kas (cash_flow)
      const { data: cashData } = await supabase
        .from('cash_flow')
        .select('tipe, nominal');

      if (cashData) {
        const keluar = cashData
          .filter((c: any) => {
            const t = (c.tipe || '').toLowerCase();
            return t === 'pengeluaran' || t === 'keluar';
          })
          .reduce((acc: number, c: any) => acc + Number(c.nominal || 0), 0);
        setTotalKasKeluar(keluar);
      }

      // 4. Bangun data tren omzet 7 hari terakhir
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const points: ChartPoint[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = dayNames[d.getDay()];

        // Jumlahkan total pesanan pada tanggal ini
        const dayTotal = nonCanceled
          .filter((o: any) => o.created_at && o.created_at.startsWith(dateStr))
          .reduce((acc: number, o: any) => acc + Number(o.total || o.total_harga || 0), 0);

        points.push({
          day: dayLabel,
          dateKey: dateStr,
          total: dayTotal,
          x: 30 + (6 - i) * 80,
          y: 170, // Nilai default awal
        });
      }

      // Hitung posisi Y grafik secara proporsional
      const maxVal = Math.max(...points.map((p) => p.total), 1);
      const computedPoints = points.map((p) => {
        if (p.total === 0) return { ...p, y: 170 };
        // Skala koordinat SVG: 170 (bawah) -> 30 (atas)
        const yPos = 170 - (p.total / maxVal) * 135;
        return { ...p, y: Math.round(yPos) };
      });

      setChartPoints(computedPoints);

      // Bentuk garis kurva SVG
      if (computedPoints.length > 0) {
        let pathStr = `M ${computedPoints[0].x},${computedPoints[0].y}`;
        for (let i = 1; i < computedPoints.length; i++) {
          const prev = computedPoints[i - 1];
          const curr = computedPoints[i];
          const midX = (prev.x + curr.x) / 2;
          pathStr += ` C ${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
        }
        setCurvePath(pathStr);
        setFillPath(`${pathStr} L ${computedPoints[computedPoints.length - 1].x},180 L ${computedPoints[0].x},180 Z`);
      }

    } catch (err) {
      console.error('Fetch Dashboard Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const labaBersih = totalPendapatan - totalKasKeluar;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* KARTU STATISTIK ATAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Total Pendapatan</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              {isLoading ? '...' : `Rp ${totalPendapatan.toLocaleString('id-ID')}`}
            </h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-full shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Perlu Verifikasi</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              {isLoading ? '...' : `${perluVerifikasiCount} Pesanan`}
            </h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center rounded-full shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Total Pesanan</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              {isLoading ? '...' : `${totalPesananCount} Transaksi`}
            </h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center rounded-full shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-3.5 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">Produk Aktif</p>
            <h3 className="text-sm sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              {isLoading ? '...' : `${totalProdukCount} Busana`}
            </h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center rounded-full shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* GRAFIK TREN & ARUS KAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* GRAFIK 7 HARI REAL DARI DATABASE */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-neutral-900 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                  Tren Penjualan 7 Hari
                </h3>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate">Ketuk titik grafik untuk melihat rincian omzet harian</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchDashboardStats}
                className="p-1.5 border border-neutral-200 hover:border-neutral-900 rounded bg-white text-neutral-700 transition"
                title="Perbarui Statistik"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {activePoint !== null && chartPoints[activePoint] && (
                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 block">
                    {chartPoints[activePoint].day} ({chartPoints[activePoint].dateKey}):
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-neutral-950">
                    Rp {chartPoints[activePoint].total.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] sm:aspect-[24/9]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-700" />
                <span className="text-[10px] uppercase tracking-wider">Memuat Grafik...</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* RINGKASAN ARUS KAS */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 sm:pb-4">
              Ringkasan Arus Kas
            </h3>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-emerald-700 mb-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Kas Masuk (Penjualan)</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-emerald-950">
                  Rp {totalPendapatan.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-rose-700 mb-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar (Operasional)</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-rose-950">
                  Rp {totalKasKeluar.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] sm:text-xs">Laba Bersih</span>
            <span className={`font-bold text-xs sm:text-sm ${labaBersih >= 0 ? 'text-neutral-950' : 'text-rose-600'}`}>
              Rp {labaBersih.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* JALUR PINTAS MENU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Verifikasi Pembayaran</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
            {perluVerifikasiCount > 0 ? `${perluVerifikasiCount} bukti transfer perlu diverifikasi.` : 'Semua pembayaran telah diverifikasi.'}
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pembayaran')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block cursor-pointer"
            >
              Buka Konfirmasi Bayar →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Buku Keuangan</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">Kelola mutasi belanja kain, operasional, dan arus kas.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block cursor-pointer"
            >
              Kelola Buku Kas →
            </button>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1.5 sm:space-y-2">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">Katalog Busana</h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">Kelola {totalProdukCount} pakaian aktif atau terbitkan busana baru.</p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('produk')}
              className="text-[11px] sm:text-xs font-bold text-neutral-950 hover:underline uppercase pt-1 block cursor-pointer"
            >
              Buka Katalog Produk →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}