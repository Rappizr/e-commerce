'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, X, Eye } from 'lucide-react';

export default function VerifikasiBayarComponent() {
  const [konfirmasi, setKonfirmasi] = useState([
    {
      id: 1,
      invoice: 'INV-20260819-01',
      pengirim: 'Siti Rahmawati',
      bank: 'BCA',
      nominal: 230000,
      tanggal: '19 Agu 2026, 10:20',
      bukti: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop',
      status: 'Menunggu',
    },
  ]);

  const [selectedBukti, setSelectedBukti] = useState<string | null>(null);

  const handleApprove = (id: number) => {
    setKonfirmasi((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'Disetujui' } : k)));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
        Verifikasi Pembayaran Masuk
      </h2>

      <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Invoice</th>
              <th className="p-4">Pengirim & Bank</th>
              <th className="p-4">Jumlah Transfer</th>
              <th className="p-4">Bukti Foto</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-medium">
            {konfirmasi.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/80">
                <td className="p-4 font-bold text-neutral-900">{item.invoice}</td>
                <td className="p-4">
                  <span className="block font-bold">{item.pengirim}</span>
                  <span className="text-[10px] text-neutral-400">Bank: {item.bank}</span>
                </td>
                <td className="p-4 font-bold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedBukti(item.bukti)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-800 underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Struk</span>
                  </button>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800"
                  >
                    Setujui
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBukti && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-4 max-w-sm w-full space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-xs font-bold uppercase">Struk Pembayaran</span>
              <button onClick={() => setSelectedBukti(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="relative aspect-[3/4] w-full bg-neutral-100">
              <Image src={selectedBukti} alt="Bukti Transfer" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}