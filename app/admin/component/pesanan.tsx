'use client';

import React, { useState } from 'react';
import { Search, MessageSquare, Truck, CheckCircle2 } from 'lucide-react';

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
  status: string;
  tanggal: string;
}

export default function PesananComponent() {
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [search, setSearch] = useState('');

  const [pesanan, setPesanan] = useState<PesananItem[]>([
    {
      id: 'ORD-20260819-01',
      pembeli: 'Siti Rahmawati',
      whatsapp: '628883199088',
      produk: 'Daster Arab Renda Rayon Premium (Maroon)',
      qty: 2,
      hargaProduk: 230000,
      ongkir: 24000,
      total: 254000,
      alamat: 'Jl. Raya Abepura No. 45, RT 03/RW 02',
      kota: 'Kota Jayapura',
      kecamatan: 'Abepura',
      status: 'Menunggu Verifikasi',
      tanggal: '19 Agu 2026, 10:15',
    },
    {
      id: 'ORD-20260819-02',
      pembeli: 'Nurul Hidayah',
      whatsapp: '6281234567890',
      produk: 'Gamis Abaya Silk Polos (Black)',
      qty: 1,
      hargaProduk: 275000,
      ongkir: 24000,
      total: 299000,
      alamat: 'Kompleks Griya Asri Blok C No. 10',
      kota: 'Kab. Tulungagung',
      kecamatan: 'Bandung',
      status: 'Diproses',
      tanggal: '19 Agu 2026, 09:30',
    },
    {
      id: 'ORD-20260818-03',
      pembeli: 'Dewi Lestari',
      whatsapp: '6285712345678',
      produk: 'Setcel Knit Crinkle Kulot (Mocca)',
      qty: 1,
      hargaProduk: 189000,
      ongkir: 24000,
      total: 213000,
      alamat: 'Jl. Merpati Putih No. 12',
      kota: 'Kota Bandung',
      kecamatan: 'Cibiru',
      status: 'Dikirim',
      tanggal: '18 Agu 2026, 16:45',
    },
  ]);

  const updateStatus = (id: string, nextStatus: string) => {
    setPesanan((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  const generateWaUrl = (item: PesananItem) => {
    const text = [
      `Assalamu'alaikum *${item.pembeli}*`,
      `Selamat datang di *ALMACO FASHION*`,
      ``,
      `Kami sudah terima pesanan anda *(${item.id})* dengan rincian sebagai berikut:`,
      ``,
      `--- *RINCIAN PRODUK* ---`,
      `• ${item.produk} (x${item.qty}) : Rp${item.hargaProduk.toLocaleString('id-ID')}`,
      `• Ongkir : Rp${item.ongkir.toLocaleString('id-ID')}`,
      `• *Total Tagihan : Rp${item.total.toLocaleString('id-ID')}*`,
      ``,
      `--- *DATA PENERIMA* ---`,
      `• Nama : ${item.pembeli}`,
      `• No HP : +${item.whatsapp}`,
      `• Alamat : ${item.alamat}`,
      `• Kota : ${item.kota}`,
      `• Kecamatan : ${item.kecamatan}`,
      ``,
      `--- *REKENING PEMBAYARAN* ---`,
      `Silakan transfer senilai *Rp${item.total.toLocaleString('id-ID')}* ke rekening resmi:`,
      ``,
      `*BANK BCA*`,
      `No. Rek : 0481980827`,
      `Atas Nama : TITIN PRAMUDYA WATI`,
      ``,
      `Jika sudah transfer, mohon lampirkan foto/screenshot bukti transfernya di sini ya. Terima kasih banyak! 🙏`,
    ].join('\n');

    return `https://api.whatsapp.com/send?phone=${item.whatsapp}&text=${encodeURIComponent(text)}`;
  };

  const filtered = pesanan.filter((p) => {
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.pembeli.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
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

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['Semua', 'Menunggu Verifikasi', 'Diproses', 'Dikirim', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[11px] font-bold uppercase px-3 py-1.5 border transition-all whitespace-nowrap ${
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

      <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
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
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/80">
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
    title="Klik untuk chat WhatsApp dan kirim rincian pesanan"
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
                      onClick={() => updateStatus(item.id, 'Diproses')}
                      className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs"
                    >
                      Verifikasi
                    </button>
                  )}
                  {item.status === 'Diproses' && (
                    <button
                      onClick={() => updateStatus(item.id, 'Dikirim')}
                      className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 inline-flex items-center gap-1 transition shadow-xs"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Kirim</span>
                    </button>
                  )}
                  {item.status === 'Dikirim' && (
                    <button
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}