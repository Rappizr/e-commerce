'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  MessageSquare, 
  Truck, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  X,
  PackageCheck
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface OrderItem {
  id: number;
  nama_produk: string;
  qty: number;
  warna: string;
  ukuran: string;
  harga: number;
  subtotal: number;
}

interface OrderRecord {
  id: number;
  invoice_no: string;
  nama_pembeli: string;
  no_hp: string;
  alamat_lengkap: string;
  status: string;
  subtotal: number;
  ongkir: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

export default function PesananComponent() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Konfirmasi Update Status
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    targetStatus: string;
    actionLabel: string;
  }>({
    show: false,
    orderId: null,
    invoiceNo: '',
    targetStatus: '',
    actionLabel: '',
  });

  const fetchOrdersFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          invoice_no,
          nama_pembeli,
          no_hp,
          alamat_lengkap,
          status,
          subtotal,
          ongkir,
          total,
          created_at,
          order_items (
            id,
            nama_produk,
            qty,
            warna,
            ukuran,
            harga,
            subtotal
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as OrderRecord[]);
      }
    } catch (err) {
      console.error('Fetch Supabase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromSupabase();
  }, []);

  const openStatusModal = (orderId: number, invoiceNo: string, targetStatus: string, actionLabel: string) => {
    setStatusModal({
      show: true,
      orderId,
      invoiceNo,
      targetStatus,
      actionLabel,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModal.orderId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: statusModal.targetStatus })
        .eq('id', statusModal.orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) => (o.id === statusModal.orderId ? { ...o, status: statusModal.targetStatus } : o))
        );
      }
    } catch (err) {
      console.error('Gagal update status di Supabase:', err);
    } finally {
      setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' });
    }
  };

  const generateWaUrl = (item: OrderRecord) => {
    const rawWa = item.no_hp ? String(item.no_hp).replace(/[^0-9]/g, '') : '';
    const phone = rawWa.startsWith('0') ? '62' + rawWa.slice(1) : rawWa;

    const itemsSummary = (item.order_items || [])
      .map((i) => `• ${i.nama_produk} (${i.ukuran || 'All Size'}, ${i.warna || 'Default'}) x${i.qty}`)
      .join('\n');

    const text = [
      `Assalamu'alaikum *${item.nama_pembeli}*`,
      `Terima kasih telah berbelanja di *ALMACO FASHION*.`,
      ``,
      `Rincian Pesanan *(${item.invoice_no})*:`,
      itemsSummary,
      `• Total Tagihan: *Rp ${Number(item.total).toLocaleString('id-ID')}*`,
      `• Status: *${item.status}*`,
      ``,
      `Alamat Pengiriman:`,
      `${item.alamat_lengkap}`,
      ``,
      `Terima kasih! 🙏`,
    ].join('\n');

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  };

  const filtered = orders.filter((o) => {
    let matchStatus = false;
    if (filterStatus === 'Semua') {
      matchStatus = true;
    } else if (filterStatus === 'Menunggu Verifikasi') {
      matchStatus = o.status === 'Menunggu Verifikasi' || o.status === 'Menunggu Pembayaran';
    } else {
      matchStatus = (o.status || '').toLowerCase() === filterStatus.toLowerCase();
    }

    const matchSearch =
      (o.invoice_no || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.nama_pembeli || '').toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4 w-full">
      {/* FILTER & SEARCH */}
      <div className="bg-white border border-neutral-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari Invoice / Nama Pembeli..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={fetchOrdersFromSupabase}
            className="p-2 border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-700 transition"
            title="Refresh Data dari Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {['Semua', 'Menunggu Verifikasi', 'Diproses', 'Dikirim', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[10px] sm:text-[11px] font-bold uppercase px-3 py-1.5 border transition-all whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-neutral-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Mengambil data Supabase...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Tidak ada pesanan yang sesuai dengan filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-xs text-neutral-950 block">{item.invoice_no}</span>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase border ${
                  item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran'
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
                  <span className="font-bold text-neutral-900">{item.nama_pembeli}</span>
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

                <div className="space-y-0.5 pt-1">
                  {(item.order_items || []).map((prod) => (
                    <p key={prod.id} className="text-[11px] text-neutral-800 line-clamp-1">
                      • {prod.nama_produk} ({prod.ukuran || 'All Size'}, {prod.warna || 'Default'}) x{prod.qty}
                    </p>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500 line-clamp-1 mt-1">{item.alamat_lengkap}</p>

                <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 text-[11px]">Total Tagihan:</span>
                  <span className="font-bold text-neutral-950 text-xs">Rp {Number(item.total).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                {(item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran') && (
                  <button
                    type="button"
                    onClick={() => openStatusModal(item.id, item.invoice_no, 'Diproses', 'Verifikasi Pembayaran')}
                    className="w-full py-2 bg-neutral-950 text-white text-[11px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs text-center"
                  >
                    Verifikasi Pembayaran
                  </button>
                )}
                {item.status === 'Diproses' && (
                  <button
                    type="button"
                    onClick={() => openStatusModal(item.id, item.invoice_no, 'Dikirim', 'Kirim Pesanan')}
                    className="w-full py-2 bg-neutral-950 text-white text-[11px] font-bold uppercase hover:bg-neutral-800 inline-flex items-center justify-center gap-1 transition shadow-xs text-center"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Kirim Pesanan</span>
                  </button>
                )}
                {item.status === 'Dikirim' && (
                  <button
                    type="button"
                    onClick={() => openStatusModal(item.id, item.invoice_no, 'Selesai', 'Tandai Selesai')}
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

      {/* TAMPILAN DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Invoice & Tanggal</th>
              <th className="p-4">Pembeli & WhatsApp</th>
              <th className="p-4">Rincian Item & Alamat</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-neutral-800" />
                  <span>Mengambil data dari database Supabase...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                  Tidak ada pesanan yang sesuai filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold text-neutral-950 block">{item.invoice_no}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold block text-neutral-900">{item.nama_pembeli}</span>
                    <a
                      href={generateWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-200 rounded-[2px] transition mt-1"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>+{item.no_hp}</span>
                    </a>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="space-y-0.5">
                      {(item.order_items || []).map((prod) => (
                        <p key={prod.id} className="font-semibold text-neutral-900 truncate">
                          • {prod.nama_produk} ({prod.ukuran || 'All Size'}, {prod.warna || 'Default'}) x{prod.qty}
                        </p>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-1">
                      {item.alamat_lengkap}
                    </p>
                  </td>

                  <td className="p-4 whitespace-nowrap font-bold text-neutral-950">
                    Rp {Number(item.total).toLocaleString('id-ID')}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-[2px] border ${
                      item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran'
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
                    {(item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran') && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(item.id, item.invoice_no, 'Diproses', 'Verifikasi Pembayaran')}
                        className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs"
                      >
                        Verifikasi
                      </button>
                    )}
                    {item.status === 'Diproses' && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(item.id, item.invoice_no, 'Dikirim', 'Kirim Pesanan')}
                        className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 inline-flex items-center gap-1 transition shadow-xs"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Kirim</span>
                      </button>
                    )}
                    {item.status === 'Dikirim' && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(item.id, item.invoice_no, 'Selesai', 'Tandai Selesai')}
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

      {/* MODAL POPUP UPDATE STATUS DI TENGAH */}
      {statusModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' })}
          />
          
          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* LOGO & BRANDING */}
            <div className="inline-flex items-center gap-2.5 mx-auto">
              <div className="relative w-8 h-8 shrink-0">
                <Image src="/logo.png" alt="Almaco Logo" fill className="object-contain" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-base uppercase tracking-tight text-neutral-950">
                  <span className="font-black">ALMACO</span>
                  <span className="font-light text-neutral-500">FASHION</span>
                </div>
                <span className="text-[8px] text-neutral-400 font-medium tracking-wide block">
                  Fashionable • Syari • Berkualitas
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-200 flex items-center justify-center mx-auto mt-1">
              <PackageCheck className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Ubah Status Pesanan
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Apakah Anda yakin ingin mengubah status pesanan <strong className="text-neutral-900 font-mono">{statusModal.invoiceNo}</strong> menjadi <strong className="text-neutral-950 uppercase">{statusModal.targetStatus}</strong>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' })}
                className="w-full py-2.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-bold uppercase tracking-wider transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="w-full py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}