'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, X, Eye } from 'lucide-react';
import { useKeranjang } from '../../penyimpanan/KeranjangContext';

export default function VerifikasiBayarComponent() {
  const { pesananList, updateStatusPesanan } = useKeranjang();
  const [selectedBukti, setSelectedBukti] = useState<string | null>(null);

  const konfirmasiList = pesananList.filter((p) => p.status === 'Menunggu Verifikasi');

  const handleApprove = (id: string) => {
    updateStatusPesanan(id, 'Diproses');
    alert('Pembayaran disetujui! Status pesanan kini beralih ke Diproses.');
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
            {konfirmasiList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                  Belum ada pembayaran yang perlu diverifikasi.
                </td>
              </tr>
            ) : (
              konfirmasiList.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/80">
                  <td className="p-4 font-bold text-neutral-900">{item.id}</td>
                  <td className="p-4">
                    <span className="block font-bold">{item.pembeli}</span>
                    <span className="text-[10px] text-neutral-400">Bank: {item.metodePembayaran}</span>
                  </td>
                  <td className="p-4 font-bold">Rp {item.total.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className="text-[11px] text-neutral-400 italic">Transfer Bank/COD</span>
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
              ))
            )}
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