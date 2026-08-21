'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, X, Eye, CheckCircle2 } from 'lucide-react';
import { useKeranjang } from '../../penyimpanan/KeranjangContext';

export default function VerifikasiBayarComponent() {
  const { pesananList, updateStatusPesanan } = useKeranjang();
  const [selectedBukti, setSelectedBukti] = useState<{ image: string; invoice: string; name: string; amount: number } | null>(null);
  const [successModal, setSuccessModal] = useState<{ show: boolean; invoiceId: string } | null>(null);

  const konfirmasiList = pesananList.filter((p: any) => p.status === 'Menunggu Verifikasi');

  const handleApprove = (id: string) => {
    updateStatusPesanan(id, 'Diproses');
    setSuccessModal({ show: true, invoiceId: id });
  };

  const defaultStrukSample = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700">
          Verifikasi Pembayaran Masuk ({konfirmasiList.length})
        </h2>
      </div>

      <div className="block md:hidden space-y-3">
        {konfirmasiList.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Belum ada pembayaran yang perlu diverifikasi saat ini.
          </div>
        ) : (
          konfirmasiList.map((item: any) => {
            const fotoBukti = item.buktiTransfer || item.buktiFoto || defaultStrukSample;

            return (
              <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-mono font-bold text-xs text-neutral-900">{item.id}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300">
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pengirim:</span>
                    <span className="font-bold text-neutral-900">{item.pembeli}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Bank:</span>
                    <span className="text-neutral-700">{item.metodePembayaran || 'BCA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total:</span>
                    <span className="font-bold text-neutral-900">Rp {item.total?.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBukti({
                        image: fotoBukti,
                        invoice: item.id,
                        name: item.pembeli,
                        amount: item.total,
                      })
                    }
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-[11px] font-semibold transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Lihat Bukti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-neutral-100/80 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
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
                  Belum ada pembayaran yang perlu diverifikasi saat ini.
                </td>
              </tr>
            ) : (
              konfirmasiList.map((item: any) => {
                const fotoBukti = item.buktiTransfer || item.buktiFoto || defaultStrukSample;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900">{item.id}</td>
                    <td className="p-4">
                      <span className="block font-bold text-neutral-900">{item.pembeli}</span>
                      <span className="text-[11px] text-neutral-500">Bank: {item.metodePembayaran || 'BCA'}</span>
                    </td>
                    <td className="p-4 font-bold text-neutral-900">
                      Rp {item.total?.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBukti({
                            image: fotoBukti,
                            invoice: item.id,
                            name: item.pembeli,
                            amount: item.total,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-[11px] font-semibold transition-colors shadow-xs rounded-[2px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Lihat Foto</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 bg-neutral-950 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition shadow-xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Setujui</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedBukti && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBukti(null)}
          />

          <div className="relative z-10 bg-white border border-neutral-200 shadow-2xl p-4 sm:p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200">
              <div className="min-w-0 pr-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                  Bukti Transfer
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono truncate">
                  {selectedBukti.invoice} — {selectedBukti.name} (Rp {selectedBukti.amount?.toLocaleString('id-ID')})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBukti(null)}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[3/4] w-full max-h-[50vh] bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
              <Image
                src={selectedBukti.image}
                alt="Bukti Transfer Struk"
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBukti(null)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase py-2.5 transition text-center"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApprove(selectedBukti.invoice);
                  setSelectedBukti(null);
                }}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase py-2.5 transition text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSuccessModal(null)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-5 sm:p-7 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Pembayaran Disetujui!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pembayaran untuk pesanan <strong className="text-neutral-900 font-mono">{successModal.invoiceId}</strong> telah diverifikasi. Status pesanan telah diubah menjadi <strong>Diproses</strong>.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 transition shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}