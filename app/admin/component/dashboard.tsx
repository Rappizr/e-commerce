"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  ShoppingBag,
  Package,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";

interface DashboardProps {
  onNavigate?: (
    menu: "pesanan" | "produk" | "pembayaran" | "testimoni" | "keuangan",
  ) => void;
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

  // State Statistik dari Katalog & Kas
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [perluVerifikasiCount, setPerluVerifikasiCount] = useState(0);
  const [totalPesananCount, setTotalPesananCount] = useState(0);
  const [totalProdukCount, setTotalProdukCount] = useState(0);
  const [totalKasKeluar, setTotalKasKeluar] = useState(0);

  // State Data Chart 7 Hari
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [curvePath, setCurvePath] = useState("M 30,170 L 510,170");
  const [fillPath, setFillPath] = useState(
    "M 30,170 L 510,170 L 510,180 L 30,180 Z",
  );

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil data pesanan secara aman
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("*");

      if (ordersErr) {
        console.error("Orders Fetch Error Detail:", ordersErr);
        throw ordersErr;
      }

      const orders = ordersData || [];

      // Status pesanan yang terverifikasi dan sah
      const validPaidStatuses = [
        "diproses",
        "dikirim",
        "selesai",
        "lunas",
        "terverifikasi",
        "sukses",
      ];

      const paidOrders = orders.filter((o: any) =>
        validPaidStatuses.includes(
          String(o.status || "")
            .trim()
            .toLowerCase(),
        ),
      );

      // Pesanan yang masih pending transfer / verifikasi
      const pendingVerif = orders.filter((o: any) => {
        const st = String(o.status || "")
          .trim()
          .toLowerCase();
        return (
          st.includes("verifikasi") ||
          st.includes("pembayaran") ||
          st.includes("pending") ||
          st.includes("konfirmasi") ||
          st.includes("menunggu")
        );
      }).length;

      setPerluVerifikasiCount(pendingVerif);
      setTotalPesananCount(orders.length);

      // 2. Ambil data kas dari tabel cash_flow
      const { data: cashData } = await supabase.from("cash_flow").select("*");

      let manualMasuk = 0;
      let totalKeluar = 0;
      const recordedOrderIds = new Set<string>();

      if (cashData && cashData.length > 0) {
        cashData.forEach((c: any) => {
          const t = String(c.tipe || "")
            .trim()
            .toLowerCase();
          const nom = Number(c.nominal || 0);

          if (c.order_id) {
            recordedOrderIds.add(String(c.order_id));
          }

          if (t.includes("masuk")) {
            manualMasuk += nom;
          } else if (t.includes("keluar")) {
            totalKeluar += nom;
          }
        });
      }

      // Hitung order online yang belum sempat dicatat ke cash_flow
      let unrecordedOrderIncome = 0;
      let unrecordedOngkirKeluar = 0;

      paidOrders
        .filter((o: any) => !recordedOrderIds.has(String(o.id)))
        .forEach((o: any) => {
          const grandTotal = Number(o.total || o.total_harga || 0);
          const ongkirVal = Number(o.ongkir || o.biaya_ongkir || 0);

          unrecordedOrderIncome += grandTotal;
          if (ongkirVal > 0) {
            unrecordedOngkirKeluar += ongkirVal;
          }
        });

      const totalPendapatanGabungan = manualMasuk + unrecordedOrderIncome;
      const totalKasKeluarGabungan = totalKeluar + unrecordedOngkirKeluar;

      setTotalPendapatan(totalPendapatanGabungan);
      setTotalKasKeluar(totalKasKeluarGabungan);

      // 3. Ambil jumlah produk aktif
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (productCount !== null && productCount !== undefined) {
        setTotalProdukCount(productCount);
      }

      // 4. Bangun data tren omzet 7 hari terakhir
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const points: ChartPoint[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - i);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const day = String(targetDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        const dayLabel = dayNames[targetDate.getDay()];

        const dayTotal = paidOrders
          .filter((o: any) => {
            if (!o.created_at) return false;
            const orderDate = new Date(o.created_at);
            const oYear = orderDate.getFullYear();
            const oMonth = String(orderDate.getMonth() + 1).padStart(2, "0");
            const oDay = String(orderDate.getDate()).padStart(2, "0");
            return `${oYear}-${oMonth}-${oDay}` === dateStr;
          })
          .reduce(
            (acc: number, o: any) =>
              acc + Number(o.total || o.total_harga || 0),
            0,
          );

        points.push({
          day: dayLabel,
          dateKey: dateStr,
          total: dayTotal,
          x: 30 + (6 - i) * 80,
          y: 170,
        });
      }

      const maxVal = Math.max(...points.map((p) => p.total), 1);
      const computedPoints = points.map((p) => {
        if (p.total === 0) return { ...p, y: 170 };
        const yPos = 170 - (p.total / maxVal) * 135;
        return { ...p, y: Math.round(yPos) };
      });

      setChartPoints(computedPoints);

      if (computedPoints.length > 0) {
        let pathStr = `M ${computedPoints[0].x},${computedPoints[0].y}`;
        for (let i = 1; i < computedPoints.length; i++) {
          const prev = computedPoints[i - 1];
          const curr = computedPoints[i];
          const midX = (prev.x + curr.x) / 2;
          pathStr += ` C ${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
        }
        setCurvePath(pathStr);
        setFillPath(
          `${pathStr} L ${computedPoints[computedPoints.length - 1].x},180 L ${computedPoints[0].x},180 Z`,
        );
      }
    } catch (err) {
      console.error("Fetch Dashboard Error:", err);
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
      {/* 4 KARTU STATISTIK ATAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* TOTAL PENDAPATAN */}
        <div className="bg-white border border-stone-200 p-3 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-900/70 truncate">
              Total Pendapatan (Gross)
            </p>
            <h3 className="text-xs xs:text-sm sm:text-lg lg:text-xl font-bold font-mono text-neutral-950 mt-1 tracking-tight break-all">
              {isLoading
                ? "..."
                : `Rp ${totalPendapatan.toLocaleString("id-ID")}`}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center rounded-full shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* PERLU VERIFIKASI */}
        <div className="bg-white border border-stone-200 p-3 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
              Perlu Verifikasi
            </p>
            <h3 className="text-xs xs:text-sm sm:text-lg lg:text-xl font-bold font-mono text-amber-950 mt-1 tracking-tight">
              {isLoading ? "..." : `${perluVerifikasiCount} Pesanan`}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-100/70 text-amber-900 border border-amber-300/70 flex items-center justify-center rounded-full shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* TOTAL PESANAN */}
        <div className="bg-white border border-stone-200 p-3 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
              Total Transaksi
            </p>
            <h3 className="text-xs xs:text-sm sm:text-lg lg:text-xl font-bold font-mono text-neutral-950 mt-1 tracking-tight">
              {isLoading ? "..." : `${totalPesananCount} Pesanan`}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center rounded-full shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* PRODUK AKTIF */}
        <div className="bg-white border border-stone-200 p-3 sm:p-5 shadow-2xs rounded-xs flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
              Produk Aktif
            </p>
            <h3 className="text-xs xs:text-sm sm:text-lg lg:text-xl font-bold font-mono text-neutral-950 mt-1 tracking-tight">
              {isLoading ? "..." : `${totalProdukCount} Busana`}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-neutral-950 text-amber-300 flex items-center justify-center rounded-full shrink-0 shadow-xs">
            <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* GRAFIK TREN & ARUS KAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* GRAFIK 7 HARI */}
        <div className="lg:col-span-8 bg-white border border-stone-200 p-4 sm:p-6 shadow-2xs rounded-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                  Tren Penjualan 7 Hari Terakhir
                </h3>
                <p className="text-[9px] sm:text-[10px] text-stone-400 truncate">
                  Memetakan omzet harian dari pesanan yang terverifikasi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDashboardStats}
                className="p-1.5 border border-stone-300 hover:border-neutral-900 rounded-2xs bg-white hover:bg-stone-50 text-neutral-700 transition cursor-pointer active:scale-95 shadow-2xs"
                title="Perbarui Statistik"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-amber-900 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
              </button>

              {activePoint !== null && chartPoints[activePoint] && (
                <div className="text-right shrink-0 bg-[#FAF8F5] px-2.5 py-1 border border-stone-200 rounded-2xs">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-900/70 block">
                    {chartPoints[activePoint].day} (
                    {chartPoints[activePoint].dateKey}):
                  </span>
                  <span className="text-[11px] sm:text-xs font-black font-mono text-neutral-950">
                    Rp {chartPoints[activePoint].total.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] sm:aspect-[24/9]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin text-amber-900" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">
                  Memuat Grafik Penjualan...
                </span>
              </div>
            ) : (
              <svg
                viewBox="0 0 540 200"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="warmGoldGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#78350f" stopOpacity="0.28" />
                    <stop
                      offset="100%"
                      stopColor="#78350f"
                      stopOpacity="0.00"
                    />
                  </linearGradient>
                </defs>

                <line
                  x1="20"
                  y1="30"
                  x2="520"
                  y2="30"
                  stroke="#f1eee7"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="80"
                  x2="520"
                  y2="80"
                  stroke="#f1eee7"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="130"
                  x2="520"
                  y2="130"
                  stroke="#f1eee7"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="180"
                  x2="520"
                  y2="180"
                  stroke="#e7e5e4"
                  strokeWidth="1"
                />

                <path d={fillPath} fill="url(#warmGoldGradient)" />
                <path
                  d={curvePath}
                  fill="none"
                  stroke="#78350f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map((pt, idx) => (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => setActivePoint(idx)}
                    onMouseEnter={() => setActivePoint(idx)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={activePoint === idx ? "7" : "4.5"}
                      className={`transition-all duration-200 ${
                        activePoint === idx
                          ? "fill-neutral-950 stroke-amber-400 stroke-[2.5]"
                          : "fill-white stroke-amber-900 stroke-2 hover:fill-amber-900"
                      }`}
                    />
                    <text
                      x={pt.x}
                      y="196"
                      textAnchor="middle"
                      className={`text-[10px] font-bold uppercase transition-colors ${
                        activePoint === idx
                          ? "fill-neutral-950 font-black"
                          : "fill-stone-400"
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
        <div className="lg:col-span-4 bg-white border border-stone-200 p-4 sm:p-6 shadow-2xs rounded-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 sm:pb-4">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">
                Ringkasan Arus Kas
              </h3>
              <Wallet className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xs">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-emerald-800 mb-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Kas Masuk (Gross)</span>
                </div>
                <p className="text-sm sm:text-base font-bold font-mono text-emerald-950">
                  Rp {totalPendapatan.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xs">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase text-rose-800 mb-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar (Inc. Ongkir)</span>
                </div>
                <p className="text-sm sm:text-base font-bold font-mono text-rose-950">
                  Rp {totalKasKeluar.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-xs">
            <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] sm:text-xs">
              Laba Bersih
            </span>
            <span
              className={`font-bold font-mono text-xs sm:text-sm ${
                labaBersih >= 0 ? "text-amber-950" : "text-rose-700"
              }`}
            >
              Rp {labaBersih.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* JALUR PINTAS MENU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* KARTU PINTAS PEMBAYARAN */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">
              Verifikasi Pembayaran
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed mt-0.5">
              {perluVerifikasiCount > 0
                ? `${perluVerifikasiCount} bukti transfer perlu dicek dan dikonfirmasi.`
                : "Semua pembayaran transaksi saat ini telah diverifikasi."}
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("pembayaran")}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-900 hover:text-amber-950 uppercase pt-2 cursor-pointer transition"
            >
              <span>Buka Konfirmasi Bayar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* KARTU PINTAS KAS */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">
              Buku Keuangan & Kas
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed mt-0.5">
              Kelola mutasi belanja bahan kain, biaya konveksi, operasional, dan
              cetak laporan kas.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("keuangan")}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-900 hover:text-amber-950 uppercase pt-2 cursor-pointer transition"
            >
              <span>Kelola Buku Kas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* KARTU PINTAS PRODUK */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-900">
              Katalog Busana & Grosir
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed mt-0.5">
              Kelola {totalProdukCount} koleksi pakaian aktif, atur seri harga
              grosir, atau tambah produk baru.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("produk")}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-900 hover:text-amber-950 uppercase pt-2 cursor-pointer transition"
            >
              <span>Buka Katalog Produk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
