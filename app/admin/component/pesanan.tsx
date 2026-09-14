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
  PackageCheck,
  Trash2,
  AlertTriangle,
  Printer,
  Barcode
} from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';
import { cetakLabelPacking, OrderRecordResi } from './resi';

export default function PesananComponent() {
  const [orders, setOrders] = useState<OrderRecordResi[]>([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // State Input Resi per pesanan
  const [resiInputs, setResiInputs] = useState<{ [key: number]: { no_resi: string; kurir: string } }>({});
  const [isSavingResi, setIsSavingResi] = useState<{ [key: number]: boolean }>({});

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

  // State Modal Konfirmasi Hapus Pesanan
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    orderId: number | null;
    invoiceNo: string;
    isDeleting: boolean;
  }>({
    show: false,
    orderId: null,
    invoiceNo: '',
    isDeleting: false,
  });

  const fetchOrders = async () => {
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
          total_harga,
          no_resi,
          kurir,
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
        setOrders(data as OrderRecordResi[]);
        const initialResi: { [key: number]: { no_resi: string; kurir: string } } = {};
        data.forEach((o: any) => {
          initialResi[o.id] = {
            no_resi: o.no_resi || '',
            kurir: (o.kurir || '').trim(),
          };
        });
        setResiInputs(initialResi);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
      console.error('Gagal update status pesanan:', err);
    } finally {
      setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' });
    }
  };

  // Simpan No. Resi dan langsung ubah status menjadi 'Dikirim'
  const handleSimpanResi = async (orderId: number) => {
    const dataResi = resiInputs[orderId];
    if (!dataResi?.no_resi.trim()) {
      alert('Mohon masukkan nomor resi pengiriman terlebih dahulu.');
      return;
    }

    const orderTarget = orders.find((o) => o.id === orderId);
    const kurirFinal = (orderTarget?.kurir || dataResi.kurir || 'REGULER').trim();

    setIsSavingResi((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          no_resi: dataResi.no_resi.trim().toUpperCase(),
          kurir: kurirFinal,
          status: 'Dikirim',
        })
        .eq('id', orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, no_resi: dataResi.no_resi.trim().toUpperCase(), kurir: kurirFinal, status: 'Dikirim' }
              : o
          )
        );
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error('Gagal simpan resi:', err);
      alert('Gagal memperbarui nomor resi: ' + err.message);
    } finally {
      setIsSavingResi((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.orderId) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await supabase.from('order_items').delete().eq('order_id', deleteModal.orderId);
      const { error } = await supabase.from('orders').delete().eq('id', deleteModal.orderId);

      if (!error) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      }
    } catch (err) {
      console.error('Gagal menghapus pesanan:', err);
    } finally {
      setDeleteModal({ show: false, orderId: null, invoiceNo: '', isDeleting: false });
    }
  };

  const generateWaUrl = (item: OrderRecordResi) => {
    const rawWa = item.no_hp ? String(item.no_hp).replace(/[^0-9]/g, '') : '';
    const phone = rawWa.startsWith('0') ? '62' + rawWa.slice(1) : rawWa;

    const itemsSummary = (item.order_items || [])
      .map((i) => `• ${i.nama_produk} (${i.ukuran || 'All Size'}, ${i.warna || 'Default'}) x${i.qty}`)
      .join('%0A');

    const kurirAktif = (item.kurir || 'Ekspedisi').toUpperCase();
    const noResiAktif = item.no_resi || resiInputs[item.id]?.no_resi;

    const resiPart = noResiAktif 
      ? `%0A📦 Kurir: *${kurirAktif}*%0A🔖 No. Resi: *${noResiAktif}*`
      : '';

    const message = [
      `Halo Kak *${item.nama_pembeli}*,`,
      `Terima kasih telah berbelanja di *ALMACO Official*.`,
      ``,
      `Berikut adalah rincian pesanan Anda:`,
      `📄 No. Invoice: *${item.invoice_no}*`,
      itemsSummary,
      `💰 Total Tagihan: *Rp ${Number(item.total || item.total_harga || 0).toLocaleString('id-ID')}*`,
      `📌 Status: *${item.status}*${resiPart}`,
      ``,
      `Ada yang bisa kami bantu terkait pesanan ini Kak? Terima kasih.`
    ].join('%0A');

    return `https://wa.me/${phone}?text=${message}`;
  };

  const filtered = orders.filter((item) => {
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      item.invoice_no?.toLowerCase().includes(q) ||
      item.nama_pembeli?.toLowerCase().includes(q) ||
      item.no_hp?.toLowerCase().includes(q) ||
      item.no_resi?.toLowerCase().includes(q) ||
      item.kurir?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4 w-full">
      {/* HEADER & FILTER */}
      <div className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Daftar Pesanan & Pengiriman
            </h2>
            <p className="text-[10px] sm:text-xs text-neutral-500">
              Kelola status transaksi, cetak resi packing, input nomor resi pengiriman, serta kontak pelanggan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={fetchOrders}
              className="p-2 border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-700 transition cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {['Semua', 'Menunggu Verifikasi', 'Diproses', 'Dikirim', 'Selesai'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition border cursor-pointer ${
                  filterStatus === st
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Invoice, Nama Pembeli, No. WhatsApp, Kurir, atau No. Resi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 pl-8 pr-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* TAMPILAN MOBILE CARDS */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-neutral-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
            <span className="text-xs font-semibold">Memuat daftar pesanan...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-6 text-center text-neutral-400 text-xs shadow-xs">
            Tidak ada pesanan yang sesuai dengan filter.
          </div>
        ) : (
          filtered.map((item) => {
            const kurirAktif = (item.kurir || 'REGULER').toUpperCase();
            return (
              <div key={item.id} className="bg-white border border-neutral-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs text-neutral-950 block">{item.invoice_no}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ show: true, orderId: item.id, invoiceNo: item.invoice_no, isDeleting: false })}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

                  <div className="mt-1.5 p-2 bg-neutral-100 border border-neutral-200 text-[10px] flex items-center justify-between">
                    <span className="font-bold uppercase text-neutral-700">Ekspedisi: {kurirAktif}</span>
                    <span className="font-mono font-bold text-neutral-950">{item.no_resi || 'Belum Ada Resi'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                    <span className="text-neutral-500 text-[11px]">Total Tagihan:</span>
                    <span className="font-bold text-neutral-950 text-xs">Rp {Number(item.total || item.total_harga || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* FITUR PACKING & RESI (MOBILE) */}
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => cetakLabelPacking(item, resiInputs[item.id]?.no_resi, item.kurir || '')}
                    className="w-full py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Cetak Label Packing</span>
                  </button>

                  {item.status === 'Diproses' && (
                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-neutral-500">Ekspedisi Terpilih:</span>
                        <span className="bg-neutral-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase rounded-xs">
                          {kurirAktif}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Masukkan No. Resi Pengiriman..."
                          value={resiInputs[item.id]?.no_resi || ''}
                          onChange={(e) =>
                            setResiInputs((prev) => ({
                              ...prev,
                              [item.id]: { no_resi: e.target.value, kurir: item.kurir || '' },
                            }))
                          }
                          className="flex-1 bg-white border border-neutral-300 px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-neutral-950"
                        />

                        <button
                          type="button"
                          disabled={isSavingResi[item.id]}
                          onClick={() => handleSimpanResi(item.id)}
                          className="px-4 py-1.5 bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                        >
                          {isSavingResi[item.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Truck className="w-3.5 h-3.5" />
                          )}
                          <span>Kirim</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran') && (
                    <button
                      type="button"
                      onClick={() => openStatusModal(item.id, item.invoice_no, 'Diproses', 'Verifikasi Pembayaran')}
                      className="w-full py-2 bg-neutral-950 text-white text-[11px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs text-center cursor-pointer"
                    >
                      Verifikasi Pembayaran
                    </button>
                  )}

                  {item.status === 'Dikirim' && (
                    <button
                      type="button"
                      onClick={() => openStatusModal(item.id, item.invoice_no, 'Selesai', 'Tandai Selesai')}
                      className="w-full py-2 bg-emerald-700 text-white text-[11px] font-bold uppercase hover:bg-emerald-800 inline-flex items-center justify-center gap-1 transition shadow-xs text-center cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Selesai</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TAMPILAN DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-neutral-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="bg-neutral-100/70 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Invoice & Tanggal</th>
              <th className="p-4">Pembeli & WhatsApp</th>
              <th className="p-4">Rincian Item & Alamat</th>
              <th className="p-4">Kurir & No. Resi</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi & Packing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-neutral-800" />
                  <span>Memuat daftar pesanan...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-400 text-xs">
                  Tidak ada pesanan yang sesuai filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const kurirAktif = (item.kurir || 'REGULER').toUpperCase();
                return (
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

                    {/* KOLOM KURIR & NO RESI */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 block w-fit mb-1">
                        {kurirAktif}
                      </span>
                      {item.no_resi ? (
                        <span className="font-mono font-bold text-xs text-neutral-950 flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-neutral-600" />
                          {item.no_resi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic block">Belum ada resi</span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap font-bold text-neutral-950">
                      Rp {Number(item.total || item.total_harga || 0).toLocaleString('id-ID')}
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
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => cetakLabelPacking(item, resiInputs[item.id]?.no_resi, item.kurir || '')}
                            className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                            title="Cetak Label Resi Packing Pengiriman"
                          >
                            <Printer className="w-3 h-3 text-neutral-600" />
                            <span>Label Packing</span>
                          </button>

                          {(item.status === 'Menunggu Verifikasi' || item.status === 'Menunggu Pembayaran') && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(item.id, item.invoice_no, 'Diproses', 'Verifikasi Pembayaran')}
                              className="px-3 py-1 bg-neutral-950 text-white text-[10px] font-bold uppercase hover:bg-neutral-800 transition shadow-xs cursor-pointer"
                            >
                              Verifikasi
                            </button>
                          )}

                          {item.status === 'Dikirim' && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(item.id, item.invoice_no, 'Selesai', 'Tandai Selesai')}
                              className="px-3 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase hover:bg-emerald-800 inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </button>
                          )}

                          {item.status === 'Selesai' && (
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Tuntas</span>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteModal({ show: true, orderId: item.id, invoiceNo: item.invoice_no, isDeleting: false })}
                            className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 rounded transition cursor-pointer"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* INPUT NO RESI KETIKA STATUS DIPROSES */}
                        {item.status === 'Diproses' && (
                          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-300 p-1 rounded-[2px]">
                            <span className="bg-neutral-900 text-white font-mono text-[9px] font-bold px-2 py-1 uppercase rounded-xs tracking-wider whitespace-nowrap">
                              {kurirAktif}
                            </span>

                            <input
                              type="text"
                              placeholder="Input No. Resi..."
                              value={resiInputs[item.id]?.no_resi || ''}
                              onChange={(e) =>
                                setResiInputs((prev) => ({
                                  ...prev,
                                  [item.id]: { no_resi: e.target.value, kurir: item.kurir || '' },
                                }))
                              }
                              className="bg-white border border-neutral-300 px-2 py-1 text-[10px] font-mono uppercase focus:outline-none focus:border-neutral-950 w-32"
                            />

                            <button
                              type="button"
                              disabled={isSavingResi[item.id]}
                              onClick={() => handleSimpanResi(item.id)}
                              className="px-2.5 py-1 bg-neutral-950 hover:bg-black text-white text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer disabled:opacity-60 shrink-0"
                              title="Simpan Resi & Ubah Status ke Dikirim"
                            >
                              {isSavingResi[item.id] ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Truck className="w-3 h-3" />
                              )}
                              <span>Kirim</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL POPUP UPDATE STATUS */}
      {statusModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' })}
          />
          
          <div className="relative z-10 w-full max-w-sm bg-white border border-neutral-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-900">
              <PackageCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                {statusModal.actionLabel}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ubah status pesanan <strong className="font-mono text-neutral-900">{statusModal.invoiceNo}</strong> menjadi <strong className="text-neutral-900">"{statusModal.targetStatus}"</strong>?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ show: false, orderId: null, invoiceNo: '', targetStatus: '', actionLabel: '' })}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="w-full py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP HAPUS PESANAN */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => !deleteModal.isDeleting && setDeleteModal({ show: false, orderId: null, invoiceNo: '', isDeleting: false })}
          />
          
          <div className="relative z-10 w-full max-w-sm bg-white border border-rose-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Pesanan
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data pesanan <strong className="font-mono text-neutral-900">{deleteModal.invoiceNo}</strong> secara permanen?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() => setDeleteModal({ show: false, orderId: null, invoiceNo: '', isDeleting: false })}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition disabled:opacity-60 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Pesanan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}