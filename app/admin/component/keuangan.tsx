'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  X,
  DollarSign
} from 'lucide-react';
import { useKeranjang } from '../../penyimpanan/KeranjangContext';

interface TransaksiKas {
  id: number | string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: 'masuk' | 'keluar';
  nominal: number;
}

export default function KeuanganComponent() {
  const { pesananList } = useKeranjang();
  const [transaksiCustom, setTransaksiCustom] = useState<TransaksiKas[]>([]);

  const transaksiPenjualan: TransaksiKas[] = pesananList.map((p) => ({
    id: p.id,
    tanggal: p.tanggal,
    keterangan: `Pesanan Web ${p.id} (${p.pembeli})`,
    kategori: 'Penjualan Web',
    tipe: 'masuk',
    nominal: p.total,
  }));

  const transaksi = [...transaksiPenjualan, ...transaksiCustom];


  const [filterTipe, setFilterTipe] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [showModal, setShowModal] = useState(false);

  const [formKas, setFormKas] = useState({
    keterangan: '',
    kategori: 'Bahan Baku & Kain',
    tipe: 'keluar' as 'masuk' | 'keluar',
    nominal: '',
  });

  const totalMasuk = transaksi
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoBersih = totalMasuk - totalKeluar;

  const handleAddTransaksi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKas.keterangan || !formKas.nominal) return;

    const newKas: TransaksiKas = {
      id: Date.now(),
      tanggal: '19 Agu 2026',
      keterangan: formKas.keterangan,
      kategori: formKas.kategori,
      tipe: formKas.tipe,
      nominal: Number(formKas.nominal.replace(/[^0-9]/g, '')),
    };

    setTransaksiCustom([newKas, ...transaksiCustom]);
    setFormKas({ keterangan: '', kategori: 'Bahan Baku & Kain', tipe: 'keluar', nominal: '' });
    setShowModal(false);
  };

  const handleDelete = (id: number | string) => {
    if (confirm('Hapus catatan transaksi ini?')) {
      setTransaksiCustom((prev) => prev.filter((t) => t.id !== id));
    }
  };


  const filteredTransaksi = transaksi.filter((t) => {
    if (filterTipe === 'semua') return true;
    return t.tipe === filterTipe;
  });

  return (
    <div className="space-y-6">
      {/* 3 Kartu Ringkasan Kas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Total Pemasukan</span>
            </p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-full">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Total Pengeluaran</span>
            </p>
            <h3 className="text-xl font-bold text-neutral-950 mt-1">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center rounded-full">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Saldo / Laba Bersih
            </p>
            <h3 className={`text-xl font-bold mt-1 ${saldoBersih >= 0 ? 'text-neutral-950' : 'text-red-600'}`}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="w-10 h-10 bg-neutral-950 text-white flex items-center justify-center rounded-full">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Kontrol Filter & Tombol Catat Transaksi */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['semua', 'masuk', 'keluar'] as const).map((tipe) => (
            <button
              key={tipe}
              onClick={() => setFilterTipe(tipe)}
              className={`text-[11px] font-bold uppercase px-4 py-2 border transition-all ${
                filterTipe === tipe
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {tipe === 'semua' ? 'Semua Kas' : tipe === 'masuk' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Kas Baru</span>
        </button>
      </div>

      {/* Tabel Mutasi Kas */}
      <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
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
            {filteredTransaksi.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/80">
                <td className="p-4 text-neutral-500 whitespace-nowrap">{item.tanggal}</td>
                <td className="p-4 font-bold text-neutral-900">{item.keterangan}</td>
                <td className="p-4">
                  <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                    {item.kategori}
                  </span>
                </td>
                <td className="p-4">
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
                <td className={`p-4 text-right font-bold ${item.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.tipe === 'masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Catat Transaksi Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Catat Transaksi Kas
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaksi} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormKas({ ...formKas, tipe: 'keluar' })}
                  className={`py-2.5 text-xs font-bold uppercase tracking-wider border transition ${
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
                  className={`py-2.5 text-xs font-bold uppercase tracking-wider border transition ${
                    formKas.tipe === 'masuk'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black'
                      : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  Kas Masuk (+)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 350000"
                  value={formKas.nominal}
                  onChange={(e) => setFormKas({ ...formKas, nominal: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-2.5 transition text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 transition text-center shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}