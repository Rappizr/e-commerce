'use client';

import React, { useState } from 'react';
import { Search, MessageSquare, Truck, CheckCircle2 } from 'lucide-react';
import { useKeranjang } from '../../penyimpanan/KeranjangContext';

interface PesananItem {
  id: string;
  pembeli: string;
  whatsapp: string;
  produk: string;
  qty: number;
  hargaProduk: number;
  ongkir: number;
  total: number;
  alamat: string;
  kota: string;
  kecamatan: string;
  tanggal?: string;
  status?: string;
  metodePembayaran?: string;
  kurir?: string;
}

export default function PesananComponent() {
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [search, setSearch] = useState('');
  const { pesananList, updateStatusPesanan } = useKeranjang();

  const updateStatus = (id: string, nextStatus: any) => {
    updateStatusPesanan(id, nextStatus);
  };

  const generateWaUrl = (item: PesananItem) => {
    const text = [
      `Assalamu'alaikum *${item.pembeli}*`,
      `Selamat datang di *ALMACO FASHION*`,
      ``,
      `Kami sudah terima pesanan anda *(${item.id})* dengan rincian sebagai berikut:`,
      ``,
      `--- *RINCIAN PRODUK* ---`,
      `• ${item.produk} (x${item.qty}) : Rp${(item.hargaProduk || 0).toLocaleString('id-ID')}`,
      `• Ongkir : Rp${(item.ongkir || 0).toLocaleString('id-ID')}`,
      `• *Total Tagihan : Rp${(item.total || 0).toLocaleString('id-ID')}*`,
      ``,
      `--- *DATA PENERIMA* ---`,
      `• Nama : ${item.pembeli}`,
      `• No HP : +${item.whatsapp}`,
      `• Alamat : ${item.alamat}`,
      `• Kota : ${item.kota}`,
      `• Kecamatan : ${item.kecamatan}`,
      ``,
      `--- *REKENING PEMBAYARAN* ---`,
      `Silakan transfer senilai *Rp${(item.total || 0).toLocaleString('id-ID')}* ke rekening resmi:`,
      ``,
      `*BANK BCA*`,
      `No. Rek : 0481980827`,
      `Atas Nama : TITIN PRAMUDYA WATI`,
      ``,
      `Jika sudah transfer, mohon lampirkan foto/screenshot bukti transfernya di sini ya. Terima kasih banyak! 🙏`,
    ].join('\n');

    return `https://api.whatsapp.com/send?phone=${item.whatsapp}&text=${encodeURIComponent(text)}`;
  };

  const filtered = pesananList.filter((p: any) => {
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.pembeli.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white border border-neutral-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari ID Pesanan / Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['Semua', 'Menunggu Verifikasi', 'Diproses', 'Dikirim', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[10px] sm:text-[11px] font-bold uppercase px-2.5 sm:px-3 py-1.5 border transition-all whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Tidak ada pesanan yang sesuai dengan filter.
          </div>
        ) : (
          filtered.map((item: any) => (
            <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-xs text-neutral-950 block">{item.id}</span>
                  <span className="text-[10px] text-neutral-400">{item.tanggal}</span>
                </div>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase border ${
                  item.status === 'Menunggu Verifikasi'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : item.status === 'Diproses'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : item.status === 'Dikirim'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">{item.pembeli}</span>
                  <a
                    href={generateWaUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WA</span>
                  </a>
                </div>

                <p className="text-[11px] text-neutral-800 line-clamp-1">{item.produk} (x{item.qty})</p>
                <p className="text-[10px] text-neutral-500 line-clamp-1">{item.alamat}, {item.kecamatan}, {item.kota}</p>

                <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 text-[11px]">Total Tagihan:</span>
                  <span className="font-bold text-neutral-950 text-xs">Rp {item.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                {item.status === 'Menunggu Verifikasi' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'Diproses')}
                    className="w-full py-2 bg-neutral-950 text-white text-[11px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs text-center"
                  >
                    Verifikasi Pembayaran
                  </button>
                )}
                {item.status === 'Diproses' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'Dikirim')}
                    className="w-full py-2 bg-neutral-950 text-white text-[11px] font-bold uppercase hover:bg-neutral-800 inline-flex items-center justify-center gap-1 transition shadow-xs text-center"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Kirim Pesanan</span>
                  </button>
                )}
                {item.status === 'Dikirim' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, 'Selesai')}
                    className="w-full py-2 bg-emerald-700 text-white text-[11px] font-bold uppercase hover:bg-emerald-800 inline-flex items-center justify-center gap-1 transition shadow-xs text-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}
                {item.status === 'Selesai' && (
                  <div className="text-center text-[10px] font-bold text-neutral-400 uppercase py-1">
                    Pesanan Tuntas
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">ID & Tanggal</th>
              <th className="p-4">Pembeli & Chat WA</th>
              <th className="p-4">Produk & Alamat</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                  Tidak ada pesanan yang sesuai.
                </td>
              </tr>
            ) : (
              filtered.map((item: any) => (
                <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold text-neutral-950 block">{item.id}</span>
                    <span className="text-[10px] text-neutral-400">{item.tanggal}</span>
                  </td>
                  
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold block text-neutral-900">{item.pembeli}</span>
                    <a
                      href={generateWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-200 rounded-[2px] transition mt-1"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>+{item.whatsapp}</span>
                    </a>
                  </td>

                  <td className="p-4 max-w-xs">
                    <p className="font-semibold text-neutral-900 line-clamp-1">{item.produk} (x{item.qty})</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {item.alamat}, {item.kecamatan}, {item.kota}
                    </p>
                  </td>

                  <td className="p-4 whitespace-nowrap font-bold text-neutral-950">
                    Rp {item.total.toLocaleString('id-ID')}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-[2px] border ${
                      item.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : item.status === 'Diproses'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : item.status === 'Dikirim'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {item.status === 'Menunggu Verifikasi' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, 'Diproses')}
                        className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs"
                      >
                        Verifikasi
                      </button>
                    )}
                    {item.status === 'Diproses' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, 'Dikirim')}
                        className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 inline-flex items-center gap-1 transition shadow-xs"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Kirim</span>
                      </button>
                    )}
                    {item.status === 'Dikirim' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, 'Selesai')}
                        className="px-3 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase hover:bg-emerald-800 inline-flex items-center gap-1 transition shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </button>
                    )}
                    {item.status === 'Selesai' && (
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Tuntas</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}