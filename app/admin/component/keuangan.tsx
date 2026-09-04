'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface TransaksiKas {
  id: string | number;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: 'masuk' | 'keluar';
  nominal: number;
  order_id?: number | string | null;
  isOrder?: boolean;
  rawDate?: string;
}

export default function KeuanganComponent() {
  const [transaksi, setTransaksi] = useState<TransaksiKas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransaksiKas | null>(null);

  const [formKas, setFormKas] = useState({
    keterangan: '',
    kategori: 'Bahan Baku & Kain',
    tipe: 'keluar' as 'masuk' | 'keluar',
    nominal: '',
  });

  // 1. Ambil data mutasi kas langsung dari tabel cash_flow Supabase
  const fetchCashFlowFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data: cashData } = await supabase.from('cash_flow').select('*').order('created_at', { ascending: false });
      const manualItems: TransaksiKas[] = (cashData || []).map((c: any) => ({
        id: c.id,
        tanggal: c.tanggal || (c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini'),
        keterangan: c.keterangan || 'Catatan Kas',
        kategori: c.kategori || 'Kas Umum',
        tipe: (c.tipe || '').toLowerCase().includes('masuk') ? 'masuk' : 'keluar',
        nominal: Number(c.nominal || 0),
        order_id: c.order_id || null,
        isOrder: false,
        rawDate: c.created_at || c.tanggal || new Date().toISOString(),
      }));

      const { data: ordersData } = await supabase.from('orders').select('id, invoice_no, nama_pembeli, status, total, total_harga, created_at').order('created_at', { ascending: false });
      const paidStatuses = ['selesai', 'diproses', 'dikirim'];
      const paidOrders = (ordersData || []).filter((ord: any) => paidStatuses.includes((ord.status || '').toLowerCase()));
      const recordedOrderIds = new Set(manualItems.filter(m => m.order_id).map(m => String(m.order_id)));
      const orderIncomeItems: TransaksiKas[] = paidOrders.filter((ord: any) => !recordedOrderIds.has(String(ord.id))).map((ord: any) => ({
        id: 'ord-' + ord.id,
        tanggal: ord.created_at ? new Date(ord.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini',
        keterangan: 'Pesanan ' + (ord.invoice_no || '') + ' - ' + (ord.nama_pembeli || 'Pelanggan'),
        kategori: 'Penjualan Produk',
        tipe: 'masuk',
        nominal: Number(ord.total || ord.total_harga || 0),
        order_id: ord.id,
        isOrder: true,
        rawDate: ord.created_at || new Date().toISOString(),
      }));

      const combined = [...manualItems, ...orderIncomeItems].sort((a, b) => new Date(b.rawDate || '').getTime() - new Date(a.rawDate || '').getTime());
      setTransaksi(combined);
    } catch (e) {
      console.error('Fetch Supabase Cash Flow Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowFromSupabase();
  }, []);

  // 2. Tambah catatan transaksi kas manual ke Katalog
  const handleAddTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKas.keterangan.trim() || !formKas.nominal) return;

    const nominalNum = Number(formKas.nominal.replace(/[^0-9]/g, ''));
    const tipePayload = formKas.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran';
    const tanggalHariIni = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('cash_flow')
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
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          keterangan: data.keterangan,
          kategori: data.kategori,
          tipe: formKas.tipe,
          nominal: nominalNum,
        };
        setTransaksi((prev) => [newKasItem, ...prev]);
      }

      setFormKas({ keterangan: '', kategori: 'Bahan Baku & Kain', tipe: 'keluar', nominal: '' });
      setShowModal(false);
    } catch (err: any) {
      console.error('Error insert cash_flow to Supabase:', err);
      alert('Gagal mencatat kas: ' + err.message);
    }
  };

  // 3. Hapus catatan transaksi kas langsung dari Katalog
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isOrder) {
      alert('Pesanan online otomatis tersinkron dengan menu Pesanan. Untuk mengelola, buka menu Pesanan.');
      setDeleteTarget(null);
      return;
    }
    const targetId = deleteTarget.id;

    try {
      const { error } = await supabase.from('cash_flow').delete().eq('id', targetId);
      if (error) throw error;

      setTransaksi((prev) => prev.filter((t) => t.id !== targetId));
    } catch (err: any) {
      console.error('Error delete cash_flow from Supabase:', err);
      alert('Gagal menghapus transaksi: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Perhitungan Ringkasan Kas
  const totalMasuk = transaksi
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoBersih = totalMasuk - totalKeluar;

  const filteredTransaksi = transaksi.filter((t) => {
    if (filterTipe === 'semua') return true;
    return t.tipe === filterTipe;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* KARTU RINGKASAN KAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              <span>Total Pemasukan</span>
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-full shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>Total Pengeluaran</span>
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mt-1 truncate">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center rounded-full shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Saldo / Laba Bersih
            </p>
            <h3 className={`text-lg sm:text-xl font-bold mt-1 truncate ${saldoBersih >= 0 ? 'text-neutral-950' : 'text-rose-600'}`}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-950 text-white flex items-center justify-center rounded-full shrink-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & TOMBOL AKSI */}
      <div className="bg-white border border-neutral-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={fetchCashFlowFromSupabase}
            className="p-2 border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-700 transition"
            title="Refresh Data Kas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {(['semua', 'masuk', 'keluar'] as const).map((tipe) => (
            <button
              key={tipe}
              onClick={() => setFilterTipe(tipe)}
              className={`text-[10px] sm:text-[11px] font-bold uppercase px-3 sm:px-4 py-2 border transition-all whitespace-nowrap ${
                filterTipe === tipe
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {tipe === 'semua' ? 'Semua Kas' : tipe === 'masuk' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Kas Baru</span>
        </button>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-neutral-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Mengambil Buku Kas...</span>
          </div>
        ) : filteredTransaksi.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Belum ada catatan mutasi kas di database.
          </div>
        ) : (
          filteredTransaksi.map((item) => (
            <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-[10px] text-neutral-400 font-mono">{item.tanggal}</span>
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 border ${
                    item.tipe === 'masuk'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {item.tipe === 'masuk' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  <span>{item.tipe === 'masuk' ? 'Masuk' : 'Keluar'}</span>
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-neutral-900 line-clamp-2">{item.keterangan}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                    {item.kategori}
                  </span>
                  <span className={`font-bold text-xs ${item.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {item.tipe === 'masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Catatan</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TAMPILAN DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Keterangan Transaksi</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Jenis</th>
              <th className="p-4 text-right">Nominal</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-neutral-800" />
                  <span>Mengambil data kas dari Katalog...</span>
                </td>
              </tr>
            ) : filteredTransaksi.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                  Belum ada catatan mutasi kas di database.
                </td>
              </tr>
            ) : (
              filteredTransaksi.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-4 text-neutral-500 whitespace-nowrap">{item.tanggal}</td>
                  <td className="p-4 font-bold text-neutral-900">{item.keterangan}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 border ${
                        item.tipe === 'masuk'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.tipe === 'masuk' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{item.tipe === 'masuk' ? 'Masuk' : 'Keluar'}</span>
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold whitespace-nowrap ${item.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {item.tipe === 'masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition rounded"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CATAT KAS BARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-md bg-white border border-neutral-200 shadow-2xl p-5 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Catat Transaksi Kas ke Katalog
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-900">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaksi} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormKas({ ...formKas, tipe: 'keluar' })}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition ${
                    formKas.tipe === 'keluar'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-black'
                      : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  Kas Keluar (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormKas({ ...formKas, tipe: 'masuk' })}
                  className={`py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition ${
                    formKas.tipe === 'masuk'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black'
                      : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  Kas Masuk (+)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Bahan Kain Rayon 2 Roll"
                  value={formKas.keterangan}
                  onChange={(e) => setFormKas({ ...formKas, keterangan: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Kategori Biaya <span className="text-red-500">*</span>
                </label>
                <select
                  value={formKas.kategori}
                  onChange={(e) => setFormKas({ ...formKas, kategori: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white cursor-pointer"
                >
                  <option value="Bahan Baku & Kain">Bahan Baku & Kain</option>
                  <option value="Jasa Jahit & Konveksi">Jasa Jahit & Konveksi</option>
                  <option value="Operasional & Packing">Operasional & Packing</option>
                  <option value="Penjualan Web">Penjualan Web</option>
                  <option value="Penjualan Offline / WA">Penjualan Offline / WA</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 350000"
                  value={formKas.nominal}
                  onChange={(e) => setFormKas({ ...formKas, nominal: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-2.5 transition text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-2.5 transition text-center shadow-xs"
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
          <div className="fixed inset-0" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white p-5 sm:p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-neutral-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Catatan Kas?
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Catatan mutasi <strong className="text-neutral-900">"{deleteTarget.keterangan}"</strong> akan dihapus permanen dari tabel sistem toko.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase py-2 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold uppercase py-2 transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}