'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, X, Eye, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface VerifikasiItem {
  id: number;
  invoice_no: string;
  nama_pembeli: string;
  bank_asal: string;
  total: number;
  bukti_transfer_url: string;
  status: string;
  created_at: string;
}

export default function VerifikasiBayarComponent() {
  const [konfirmasiList, setKonfirmasiList] = useState<VerifikasiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBukti, setSelectedBukti] = useState<{ 
    id: number;
    image: string; 
    invoice: string; 
    name: string; 
    amount: number 
  } | null>(null);
  const [successModal, setSuccessModal] = useState<{ show: boolean; invoiceId: string } | null>(null);

  // 1. Ambil data pesanan yang berstatus 'Menunggu Verifikasi' atau 'Menunggu Pembayaran' yang ada buktinya
  const fetchVerifikasiFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, invoice_no, nama_pembeli, bank_asal, total, total_harga, bukti_transfer_url, bukti_transfer, status, created_at')
        .or('status.eq.Menunggu Verifikasi,status.eq.Menunggu Pembayaran')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: VerifikasiItem[] = data.map((item: any) => ({
          id: item.id,
          invoice_no: item.invoice_no,
          nama_pembeli: item.nama_pembeli,
          bank_asal: item.bank_asal || 'BCA',
          total: Number(item.total || item.total_harga || 0),
          bukti_transfer_url: item.bukti_transfer_url || item.bukti_transfer || '',
          status: item.status,
          created_at: item.created_at,
        }));
        setKonfirmasiList(mapped);
      }
    } catch (err) {
      console.error('Fetch verifikasi error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasiFromSupabase();
  }, []);

  // 2. Setujui Pembayaran: Update status tabel `orders` dan insert ke tabel `cash_flow`
  const handleApprove = async (orderId: number, invoiceNo: string, nominal: number) => {
    try {
      // Update status di orders menjadi 'Diproses'
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: 'Diproses' })
        .eq('id', orderId);

      if (orderErr) throw orderErr;

      // Catat pemasukan kas otomatis ke tabel cash_flow
      await supabase.from('cash_flow').insert([
        {
          order_id: orderId,
          tipe: 'Pemasukan',
          kategori: 'Penjualan Produk',
          nominal: nominal,
          keterangan: `Pembayaran Lunas Invoice: ${invoiceNo}`,
          tanggal: new Date().toISOString().split('T')[0],
        },
      ]);

      setKonfirmasiList((prev) => prev.filter((item) => item.id !== orderId));
      setSuccessModal({ show: true, invoiceId: invoiceNo });
    } catch (err: any) {
      console.error('Gagal menyetujui pembayaran:', err);
      alert('Gagal menyetujui pembayaran: ' + err.message);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between bg-white border border-neutral-200 p-3.5 sm:p-4 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
            Verifikasi Pembayaran Masuk ({konfirmasiList.length})
          </h2>
          <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
            Cek kesesuaian struk transfer yang dikirim pembeli dan verifikasi pesanan.
          </p>
        </div>

        <button
          onClick={fetchVerifikasiFromSupabase}
          className="p-2 border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-700 transition"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-neutral-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat Data Verifikasi...</span>
          </div>
        ) : konfirmasiList.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Belum ada pembayaran yang perlu diverifikasi saat ini.
          </div>
        ) : (
          konfirmasiList.map((item) => {
            const hasBukti = Boolean(item.bukti_transfer_url);

            return (
              <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-mono font-bold text-xs text-neutral-900">{item.invoice_no}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300">
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pengirim:</span>
                    <span className="font-bold text-neutral-900">{item.nama_pembeli}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Bank:</span>
                    <span className="text-neutral-700">{item.bank_asal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total:</span>
                    <span className="font-bold text-neutral-900">Rp {item.total?.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    disabled={!hasBukti}
                    onClick={() =>
                      setSelectedBukti({
                        id: item.id,
                        image: item.bukti_transfer_url,
                        invoice: item.invoice_no,
                        name: item.nama_pembeli,
                        amount: item.total,
                      })
                    }
                    className={`inline-flex items-center justify-center gap-1 px-3 py-2 border text-[11px] font-semibold transition-colors shadow-xs ${
                      hasBukti
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                        : 'bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{hasBukti ? 'Lihat Bukti' : 'Belum Upload'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(item.id, item.invoice_no, item.total)}
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

      {/* TAMPILAN DESKTOP TABLE */}
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-neutral-800" />
                  <span>Memuat data verifikasi...</span>
                </td>
              </tr>
            ) : konfirmasiList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                  Belum ada pembayaran yang perlu diverifikasi saat ini.
                </td>
              </tr>
            ) : (
              konfirmasiList.map((item) => {
                const hasBukti = Boolean(item.bukti_transfer_url);

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900">{item.invoice_no}</td>
                    <td className="p-4">
                      <span className="block font-bold text-neutral-900">{item.nama_pembeli}</span>
                      <span className="text-[11px] text-neutral-500">Bank: {item.bank_asal}</span>
                    </td>
                    <td className="p-4 font-bold text-neutral-900">
                      Rp {item.total?.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      {hasBukti ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBukti({
                              id: item.id,
                              image: item.bukti_transfer_url,
                              invoice: item.invoice_no,
                              name: item.nama_pembeli,
                              amount: item.total,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-[11px] font-semibold transition-colors shadow-xs rounded-[2px]"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Lihat Foto</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">Belum Dikirim</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id, item.invoice_no, item.total)}
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

      {/* MODAL PRATINJAU BUKTI STRUK */}
      {selectedBukti && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setSelectedBukti(null)} />

          <div className="relative z-10 bg-white border border-neutral-200 shadow-2xl p-4 sm:p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200">
              <div className="min-w-0 pr-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                  Bukti Transfer Struk
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
                  handleApprove(selectedBukti.id, selectedBukti.invoice, selectedBukti.amount);
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

      {/* MODAL SUKSES VERIFIKASI */}
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
                Pembayaran untuk pesanan <strong className="text-neutral-900 font-mono">{successModal.invoiceId}</strong> telah diverifikasi dan kas pemasukan otomatis tercatat di buku kas.
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