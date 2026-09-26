"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Truck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  PackageCheck,
  Trash2,
  AlertTriangle,
  Printer,
  Barcode,
  X,
  Clock,
  Filter,
  MessageSquareQuote,
  User,
  Phone,
  MapPin,
  Eye,
  XCircle,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";
import { cetakLabelPacking, OrderRecordResi } from "./resi";

// IKON RESMI LOGO WHATSAPP
function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.182 8.182 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function PesananComponent() {
  const [orders, setOrders] = useState<OrderRecordResi[]>([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Detail Pembeli
  const [selectedBuyerDetail, setSelectedBuyerDetail] =
    useState<OrderRecordResi | null>(null);

  // State Input Resi per pesanan
  const [resiInputs, setResiInputs] = useState<{
    [key: number]: { no_resi: string; kurir: string };
  }>({});
  const [isSavingResi, setIsSavingResi] = useState<{ [key: number]: boolean }>(
    {},
  );

  // State Modal Tolak Pesanan & Kembalikan Stok
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    order: OrderRecordResi | null;
    alasan: string;
    catatanTambahan: string;
    isSubmitting: boolean;
  }>({
    show: false,
    order: null,
    alasan: "Stok Barang Habis",
    catatanTambahan: "",
    isSubmitting: false,
  });

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
    invoiceNo: "",
    targetStatus: "",
    actionLabel: "",
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
    invoiceNo: "",
    isDeleting: false,
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
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
          catatan,
          created_at,
          order_items (
            id,
            product_id,
            nama_produk,
            qty,
            warna,
            ukuran,
            harga,
            subtotal
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderRecordResi[]);
        const initialResi: {
          [key: number]: { no_resi: string; kurir: string };
        } = {};
        data.forEach((o: any) => {
          initialResi[o.id] = {
            no_resi: o.no_resi || "",
            kurir: (o.kurir || "").trim(),
          };
        });
        setResiInputs(initialResi);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openStatusModal = (
    orderId: number,
    invoiceNo: string,
    targetStatus: string,
    actionLabel: string,
  ) => {
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
        .from("orders")
        .update({ status: statusModal.targetStatus })
        .eq("id", statusModal.orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === statusModal.orderId
              ? { ...o, status: statusModal.targetStatus }
              : o,
          ),
        );
      }
    } catch (err) {
      console.error("Gagal update status pesanan:", err);
    } finally {
      setStatusModal({
        show: false,
        orderId: null,
        invoiceNo: "",
        targetStatus: "",
        actionLabel: "",
      });
    }
  };

  // Logika Tolak Pesanan + Kembalikan Stok Produk
  const handleConfirmReject = async () => {
    const { order, alasan, catatanTambahan } = rejectModal;
    if (!order) return;

    setRejectModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // 1. KEMBALIKAN STOK KE TABEL PRODUCTS
      for (const item of order.order_items || []) {
        const prodItem = item as any;
        if (prodItem.product_id) {
          const { data: currentProduct } = await supabase
            .from("products")
            .select("stok")
            .eq("id", prodItem.product_id)
            .single();

          if (currentProduct) {
            await supabase
              .from("products")
              .update({ stok: (currentProduct.stok || 0) + item.qty })
              .eq("id", prodItem.product_id);
          }
        } else {
          const { data: currentProduct } = await supabase
            .from("products")
            .select("id, stok")
            .eq("nama", item.nama_produk)
            .single();

          if (currentProduct) {
            await supabase
              .from("products")
              .update({ stok: (currentProduct.stok || 0) + item.qty })
              .eq("id", currentProduct.id);
          }
        }
      }

      // 2. UPDATE STATUS PESANAN MENJADI DIBATALKAN
      const reasonFull = catatanTambahan
        ? `${alasan}: ${catatanTambahan}`
        : alasan;

      const { error } = await supabase
        .from("orders")
        .update({
          status: "Dibatalkan",
          catatan: reasonFull,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: "Dibatalkan", catatan: reasonFull }
            : o,
        ),
      );

      // 3. BUKA WHATSAPP OTOMATIS DENGAN FORMAT PEMBATALAN
      const waUrl = generateWaTolakUrl(order, alasan, catatanTambahan);
      window.open(waUrl, "_blank");
    } catch (err: any) {
      console.error("Gagal menolak pesanan:", err);
      alert("Gagal menolak pesanan: " + err.message);
    } finally {
      setRejectModal({
        show: false,
        order: null,
        alasan: "Stok Barang Habis",
        catatanTambahan: "",
        isSubmitting: false,
      });
    }
  };

  const handleSimpanResi = async (orderId: number) => {
    const dataResi = resiInputs[orderId];
    if (!dataResi?.no_resi.trim()) {
      alert("Mohon masukkan nomor resi pengiriman terlebih dahulu.");
      return;
    }

    const orderTarget = orders.find((o) => o.id === orderId);
    const kurirFinal = (
      orderTarget?.kurir ||
      dataResi.kurir ||
      "REGULER"
    ).trim();

    setIsSavingResi((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          no_resi: dataResi.no_resi.trim().toUpperCase(),
          kurir: kurirFinal,
          status: "Dikirim",
        })
        .eq("id", orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  no_resi: dataResi.no_resi.trim().toUpperCase(),
                  kurir: kurirFinal,
                  status: "Dikirim",
                }
              : o,
          ),
        );
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error("Gagal simpan resi:", err);
      alert("Gagal memperbarui nomor resi: " + err.message);
    } finally {
      setIsSavingResi((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.orderId) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", deleteModal.orderId);
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", deleteModal.orderId);

      if (!error) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      }
    } catch (err) {
      console.error("Gagal menghapus pesanan:", err);
    } finally {
      setDeleteModal({
        show: false,
        orderId: null,
        invoiceNo: "",
        isDeleting: false,
      });
    }
  };

  // Format Chat WA Khusus Penolakan / Pembatalan
  const generateWaTolakUrl = (
    order: OrderRecordResi,
    alasan: string,
    catatanTambahan: string,
  ) => {
    const rawWa = order.no_hp ? String(order.no_hp).replace(/[^0-9]/g, "") : "";
    const phone = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : rawWa;

    const itemsSummary = (order.order_items || [])
      .map(
        (i) =>
          `- ${i.nama_produk} (${i.ukuran || "All Size"}, ${i.warna || "Default"}) x${i.qty}`,
      )
      .join("\n");

    const totalFormat = `Rp ${Number(order.total || order.total_harga || 0).toLocaleString("id-ID")}`;

    let penjelasan = "";
    if (alasan === "Stok Barang Habis") {
      penjelasan =
        "Mohon maaf yang sebesar-besarnya, stok busana yang Anda pesan saat ini sedang habis terjual. Jika Anda sudah terlanjur melakukan transfer dana, mohon segera kirimkan nomor rekening Anda agar dana kami kembalikan 100% (Refund).";
    } else if (alasan === "Bukti Transfer Tidak Valid / Tidak Masuk") {
      penjelasan =
        "Kami telah memeriksa mutasi rekening kami, namun dana transfer Anda belum masuk atau bukti transfer yang diunggah kurang jelas/tidak valid. Mohon kirimkan ulang struk resmi mutasi bank Anda.";
    } else {
      penjelasan = `Keterangan: ${alasan}.${catatanTambahan ? `\nCatatan Admin: ${catatanTambahan}` : ""}`;
    }

    const text = `Halo Kak *${order.nama_pembeli}*,

Kami dari Admin *ALMACO FASHION* ingin menginformasikan terkait pesanan Anda:
*No. Invoice:* ${order.invoice_no}

*Detail Produk:*
${itemsSummary}
*Total:* ${totalFormat}

*Status Pesanan: DIBATALKAN / DITOLAK*

*Keterangan:*
${penjelasan}

Jika ada pertanyaan atau butuh bantuan lebih lanjut, silakan balas pesan ini ya Kak. Terima kasih banyak atas pengertiannya. 🙏`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // FORMAT CHAT WHATSAPP OTOMATIS STANDAR
  const generateWaUrl = (item: OrderRecordResi) => {
    if (item.status === "Dibatalkan") {
      return generateWaTolakUrl(item, item.catatan || "Pesanan Dibatalkan", "");
    }

    const rawWa = item.no_hp ? String(item.no_hp).replace(/[^0-9]/g, "") : "";
    const phone = rawWa.startsWith("0") ? "62" + rawWa.slice(1) : rawWa;

    const itemsSummary = (item.order_items || [])
      .map(
        (i) =>
          `- ${i.nama_produk} (${i.ukuran || "All Size"}, ${i.warna || "Default"}) x${i.qty}`,
      )
      .join("\n");

    const totalFormat = `Rp ${Number(item.total || item.total_harga || 0).toLocaleString("id-ID")}`;
    const kurirAktif = (item.kurir || "Ekspedisi").toUpperCase();
    const noResiAktif = item.no_resi || resiInputs[item.id]?.no_resi || "-";
    const originUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    const alamatTujuan = item.alamat_lengkap?.trim() || "-";
    const catatanPembeli = item.catatan
      ? `\n*Catatan Pembeli:* "${item.catatan}"\n`
      : "";

    let textMessage = "";

    // KONDISI 1: BELUM BAYAR / MENUNGGU KONFIRMASI
    if (
      item.status === "Menunggu Pembayaran" ||
      item.status === "Menunggu Verifikasi"
    ) {
      textMessage = `Halo Kak *${item.nama_pembeli}*,

Terima kasih banyak sudah memesan di *ALMACO FASHION*.

Berikut rincian pesanan Anda:
*No. Invoice:* ${item.invoice_no}

*Detail Produk:*
${itemsSummary}
${catatanPembeli}
*Total Tagihan:* ${totalFormat}

*Alamat Tujuan Pengiriman:*
${alamatTujuan}

*Instruksi Pembayaran:*
Silakan transfer tepat sesuai nominal ke rekening resmi kami:
- Bank BCA: 0481980827
- A.n: TITIN PRAMUDYA WATI

*Upload Bukti Pembayaran:*
Jika sudah melakukan transfer, mohon konfirmasi dan upload bukti struknya melalui tautan ini:
${originUrl}/konfirmasi-pembayaran?invoice=${item.invoice_no}

Pesanan akan langsung kami proses setelah pembayaran terverifikasi. Terima kasih!`;
    }
    // KONDISI 2: TELAH DIKIRIM / SELESAI
    else if (item.status === "Dikirim" || item.status === "Selesai") {
      textMessage = `Halo Kak *${item.nama_pembeli}*,

Kabar baik, pesanan Anda dari *ALMACO FASHION* saat ini *sudah selesai kami kemas dan telah kami serahkan ke pihak kurir/ekspedisi* untuk dikirimkan ke alamat Anda.

Berikut rincian pengiriman:
*No. Invoice:* ${item.invoice_no}
*Ekspedisi:* ${kurirAktif}
*No. Resi:* ${noResiAktif}

*Detail Produk:*
${itemsSummary}
${catatanPembeli}
*Alamat Tujuan:*
${alamatTujuan}

*Status:* ${item.status}

Paket sedang dalam perjalanan. Semoga busananya sampai dengan aman dan nyaman dikenakan ya Kak.

Terima kasih banyak sudah berbelanja di toko kami!`;
    }
    // KONDISI 3: STATUS LAINNYA
    else {
      textMessage = `Halo Kak *${item.nama_pembeli}*,

Terima kasih telah berbelanja di *ALMACO FASHION*.

Rincian pesanan Anda:
*No. Invoice:* ${item.invoice_no}

*Detail Produk:*
${itemsSummary}
${catatanPembeli}
*Alamat Tujuan:*
${alamatTujuan}

*Total:* ${totalFormat}
*Status:* ${item.status}

Pesanan Kakak sedang kami siapkan. Jika ada hal yang ingin ditanyakan, silakan balas pesan ini ya Kak. Terima kasih!`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`;
  };

  const filterTabs = [
    { label: "Semua", value: "Semua" },
    { label: "Menunggu Verifikasi", value: "Menunggu Verifikasi" },
    { label: "Diproses", value: "Diproses" },
    { label: "Dikirim", value: "Dikirim" },
    { label: "Selesai", value: "Selesai" },
    { label: "Dibatalkan", value: "Dibatalkan" },
  ];

  const getFilteredCount = (val: string) => {
    if (val === "Semua") return orders.length;
    if (val === "Menunggu Verifikasi") {
      return orders.filter(
        (o) =>
          o.status === "Menunggu Verifikasi" ||
          o.status === "Menunggu Pembayaran",
      ).length;
    }
    return orders.filter((o) => o.status === val).length;
  };

  const filtered = orders.filter((item) => {
    let matchStatus = true;
    if (filterStatus === "Menunggu Verifikasi") {
      matchStatus =
        item.status === "Menunggu Verifikasi" ||
        item.status === "Menunggu Pembayaran";
    } else if (filterStatus !== "Semua") {
      matchStatus = item.status === filterStatus;
    }

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.invoice_no?.toLowerCase().includes(q) ||
      item.nama_pembeli?.toLowerCase().includes(q) ||
      item.no_hp?.toLowerCase().includes(q) ||
      item.no_resi?.toLowerCase().includes(q) ||
      item.catatan?.toLowerCase().includes(q) ||
      item.kurir?.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const renderStatusBadge = (status: string) => {
    if (status === "Menunggu Verifikasi" || status === "Menunggu Pembayaran") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
          <Clock className="w-3 h-3 text-amber-700" />
          <span>{status}</span>
        </span>
      );
    }
    if (status === "Diproses") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
          <PackageCheck className="w-3 h-3 text-blue-600" />
          <span>Diproses</span>
        </span>
      );
    }
    if (status === "Dikirim") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
          <Truck className="w-3 h-3 text-purple-600" />
          <span>Dikirim</span>
        </span>
      );
    }
    if (status === "Dibatalkan") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Dibatalkan</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-2xs bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Selesai</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      {/* HEADER & FILTER */}
      <div className="shrink-0 bg-white border border-stone-200 p-4 sm:p-5 space-y-4 shadow-2xs rounded-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
                <Truck className="w-4 h-4" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Manajemen Pesanan & Resi Pengiriman
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
              Pantau pembayaran masuk, cetak label resi packing, input nomor
              resi ekspedisi, dan koordinasi pelanggan.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:border-neutral-900 bg-white hover:bg-stone-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer active:scale-95"
            title="Segarkan Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-900 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* TAB FILTER STATUS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {filterTabs.map((tab) => {
            const count = getFilteredCount(tab.value);
            const isActive = filterStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition border cursor-pointer rounded-2xs flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-neutral-950 text-amber-100 border-neutral-950 shadow-2xs"
                    : "bg-[#FAF8F5] text-neutral-600 border-stone-200 hover:bg-white hover:border-stone-400"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 text-[9px] font-mono rounded-full ${
                    isActive
                      ? "bg-amber-900 text-amber-100"
                      : "bg-stone-200 text-neutral-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari No. Invoice, Nama Pembeli, Catatan, WhatsApp, Kurir, atau Resi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-stone-300 pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-amber-900 transition-colors shadow-2xs rounded-2xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-neutral-900 transition p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="block lg:hidden flex-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 space-y-3">
        {isLoading ? (
          <div className="bg-white border border-stone-200 p-8 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 rounded-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-900" />
            <span className="text-xs font-semibold">
              Memuat daftar pesanan...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 p-8 text-center text-stone-400 text-xs shadow-2xs rounded-xs">
            Tidak ada pesanan yang cocok dengan kriteria pencarian / filter ini.
          </div>
        ) : (
          filtered.map((item) => {
            const kurirAktif = (item.kurir || "REGULER").toUpperCase();
            const canCancel =
              item.status === "Menunggu Verifikasi" ||
              item.status === "Menunggu Pembayaran";

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 p-4 space-y-3 shadow-2xs rounded-xs"
              >
                <div className="flex items-start justify-between border-b border-stone-100 pb-2.5 gap-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs sm:text-sm text-neutral-950 block truncate">
                      {item.invoice_no}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderStatusBadge(item.status)}
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({
                          show: true,
                          orderId: item.id,
                          invoiceNo: item.invoice_no,
                          isDeleting: false,
                        })
                      }
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition rounded cursor-pointer"
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedBuyerDetail(item)}
                      className="font-bold text-neutral-900 hover:text-amber-900 transition flex items-center gap-1 group text-left cursor-pointer"
                      title="Klik untuk melihat detail lengkap pembeli"
                    >
                      <span>{item.nama_pembeli}</span>
                      <Eye className="w-3 h-3 text-stone-400 group-hover:text-amber-900" />
                    </button>

                    <a
                      href={generateWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 border border-emerald-300 rounded-2xs transition shadow-2xs"
                      title="Hubungi Pembeli via WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Chat WA</span>
                    </a>
                  </div>

                  <div className="space-y-0.5 pt-1 bg-[#FAF8F5] p-2 border border-stone-200/80 rounded-2xs">
                    {(item.order_items || []).map((prod) => (
                      <p
                        key={prod.id}
                        className="text-[11px] text-neutral-800 line-clamp-1"
                      >
                        - {prod.nama_produk} ({prod.ukuran || "All Size"},{" "}
                        {prod.warna || "Default"}){" "}
                        <span className="font-bold font-mono">x{prod.qty}</span>
                      </p>
                    ))}
                  </div>

                  {/* CATATAN KHUSUS PEMBELI (MOBILE) */}
                  {item.catatan && item.catatan.trim() && (
                    <div className="p-2 bg-amber-50/90 border border-amber-300/80 text-[10px] text-amber-950 rounded-2xs flex items-start gap-1.5">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[8.5px] text-amber-900 block">
                          Catatan:
                        </span>
                        <span className="italic leading-snug">
                          "{item.catatan.trim()}"
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                    Alamat: {item.alamat_lengkap}
                  </p>

                  <div className="mt-1.5 p-2 bg-stone-50 border border-stone-200 text-[10px] flex items-center justify-between rounded-2xs">
                    <span className="font-bold uppercase text-neutral-700">
                      Kurir: {kurirAktif}
                    </span>
                    <span className="font-mono font-bold text-amber-950 flex items-center gap-1">
                      <Barcode className="w-3 h-3 text-stone-500" />
                      {item.no_resi || "Belum Ada Resi"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                    <span className="text-neutral-500 text-[11px]">
                      Total Tagihan:
                    </span>
                    <span className="font-bold text-amber-950 font-mono text-xs sm:text-sm">
                      Rp{" "}
                      {Number(
                        item.total || item.total_harga || 0,
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      cetakLabelPacking(
                        item,
                        resiInputs[item.id]?.no_resi,
                        item.kurir || "",
                      )
                    }
                    className="w-full py-2 bg-white border border-stone-300 hover:bg-stone-50 text-neutral-800 text-[11px] font-bold uppercase inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs rounded-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" />
                    <span>Cetak Label Packing</span>
                  </button>

                  {item.status === "Diproses" && (
                    <div className="p-2.5 bg-[#FAF8F5] border border-amber-200/80 space-y-2 rounded-2xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase text-amber-900">
                          Input Nomor Resi:
                        </span>
                        <span className="bg-neutral-900 text-amber-100 font-mono font-bold px-1.5 py-0.2 rounded-2xs">
                          {kurirAktif}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Masukkan No. Resi..."
                          value={resiInputs[item.id]?.no_resi || ""}
                          onChange={(e) =>
                            setResiInputs((prev) => ({
                              ...prev,
                              [item.id]: {
                                no_resi: e.target.value,
                                kurir: item.kurir || "",
                              },
                            }))
                          }
                          className="flex-1 bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-amber-900 rounded-2xs"
                        />

                        <button
                          type="button"
                          disabled={isSavingResi[item.id]}
                          onClick={() => handleSimpanResi(item.id)}
                          className="px-3.5 py-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0 shadow-2xs rounded-2xs"
                        >
                          {isSavingResi[item.id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>Kirim</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {canCancel && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRejectModal({
                            show: true,
                            order: item,
                            alasan: "Stok Barang Habis",
                            catatanTambahan: "",
                            isSubmitting: false,
                          })
                        }
                        className="w-full py-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-bold uppercase tracking-wider transition rounded-2xs text-center cursor-pointer"
                      >
                        Tolak
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openStatusModal(
                            item.id,
                            item.invoice_no,
                            "Diproses",
                            "Verifikasi Pembayaran",
                          )
                        }
                        className="w-full py-2.5 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-wider transition shadow-2xs text-center cursor-pointer rounded-2xs"
                      >
                        Verifikasi
                      </button>
                    </div>
                  )}

                  {item.status === "Dikirim" && (
                    <button
                      type="button"
                      onClick={() =>
                        openStatusModal(
                          item.id,
                          item.invoice_no,
                          "Selesai",
                          "Tandai Selesai",
                        )
                      }
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold uppercase inline-flex items-center justify-center gap-1.5 transition shadow-2xs text-center cursor-pointer rounded-2xs"
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
      <div className="hidden lg:block flex-1 bg-white border border-stone-200 shadow-2xs rounded-xs overflow-hidden">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)]">
          <table className="w-full text-left text-xs min-w-[1100px] border-collapse">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500 sticky top-0 z-20 shadow-xs">
              <tr>
                <th className="p-3.5 pl-4 bg-[#FAF8F5] min-w-[170px]">
                  Invoice & Tanggal
                </th>
                <th className="p-3.5 bg-[#FAF8F5] min-w-[150px]">
                  Pembeli & Kontak
                </th>
                <th className="p-3.5 max-w-[240px] bg-[#FAF8F5]">
                  Rincian Item & Alamat
                </th>
                {/* KOLOM CATATAN SENDIRI */}
                <th className="p-3.5 max-w-[180px] bg-[#FAF8F5]">
                  Catatan Pembeli
                </th>
                <th className="p-3.5 bg-[#FAF8F5] min-w-[130px]">
                  Ekspedisi & Resi
                </th>
                <th className="p-3.5 bg-[#FAF8F5] min-w-[110px]">
                  Total Tagihan
                </th>
                <th className="p-3.5 bg-[#FAF8F5]">Status</th>
                <th className="p-3.5 pr-4 text-center bg-[#FAF8F5]">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-900" />
                    <span className="text-xs">Memuat daftar pesanan...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-stone-400 text-xs"
                  >
                    Tidak ada transaksi yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const kurirAktif = (item.kurir || "REGULER").toUpperCase();
                  const canCancel =
                    item.status === "Menunggu Verifikasi" ||
                    item.status === "Menunggu Pembayaran";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FCFAF7] transition-colors"
                    >
                      <td className="p-3.5 pl-4 whitespace-nowrap align-top">
                        <span className="font-bold text-neutral-950 font-mono text-xs sm:text-[13px] block tracking-tight">
                          {item.invoice_no}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap align-top">
                        {/* NAMA PEMBELI DAPAT DIKLIK UNTUK LIHAT DETAIL LENGKAP */}
                        <button
                          type="button"
                          onClick={() => setSelectedBuyerDetail(item)}
                          className="font-bold text-neutral-900 hover:text-amber-900 transition flex items-center gap-1.5 group cursor-pointer text-left"
                          title="Klik untuk membuka detail lengkap pembeli"
                        >
                          <span className="underline-offset-2 group-hover:underline">
                            {item.nama_pembeli}
                          </span>
                          <Eye className="w-3 h-3 text-stone-400 group-hover:text-amber-900" />
                        </button>

                        <a
                          href={generateWaUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 border border-emerald-300 rounded-2xs transition mt-1 shadow-2xs"
                          title="Hubungi Pembeli via WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>+{item.no_hp}</span>
                        </a>
                      </td>

                      <td className="p-3.5 max-w-[240px] align-top">
                        <div className="space-y-0.5">
                          {(item.order_items || []).map((prod) => (
                            <p
                              key={prod.id}
                              className="text-neutral-900 truncate text-[11px]"
                            >
                              - {prod.nama_produk} ({prod.ukuran || "All Size"},{" "}
                              {prod.warna || "Default"}){" "}
                              <strong className="font-mono">x{prod.qty}</strong>
                            </p>
                          ))}
                        </div>

                        <p
                          className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed"
                          title={item.alamat_lengkap}
                        >
                          Alamat: {item.alamat_lengkap}
                        </p>
                      </td>

                      {/* KOLOM CATATAN SENDIRI */}
                      <td className="p-3.5 max-w-[180px] align-top">
                        {item.catatan && item.catatan.trim() ? (
                          <div className="p-2 bg-amber-50/90 border border-amber-300/80 text-[10.5px] text-amber-950 rounded-2xs">
                            <div className="flex items-center gap-1 font-bold text-[8.5px] uppercase tracking-wider text-amber-900 mb-0.5">
                              <MessageSquareQuote className="w-3 h-3 text-amber-700" />
                              <span>Catatan:</span>
                            </div>
                            <p className="italic leading-snug break-words">
                              "{item.catatan.trim()}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">
                            Tidak ada catatan
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap align-top">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 bg-amber-50 px-2 py-0.5 border border-amber-200 block w-fit mb-1 rounded-2xs">
                          {kurirAktif}
                        </span>
                        {item.no_resi ? (
                          <span className="font-mono font-bold text-xs text-neutral-950 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-stone-500" />
                            {item.no_resi}
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic block">
                            Belum ada resi
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap align-top font-bold font-mono text-amber-950">
                        Rp{" "}
                        {Number(
                          item.total || item.total_harga || 0,
                        ).toLocaleString("id-ID")}
                      </td>

                      <td className="p-3.5 whitespace-nowrap align-top">
                        {renderStatusBadge(item.status)}
                      </td>

                      <td className="p-3.5 pr-4 text-center whitespace-nowrap align-top">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                cetakLabelPacking(
                                  item,
                                  resiInputs[item.id]?.no_resi,
                                  item.kurir || "",
                                )
                              }
                              className="px-2.5 py-1 bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 hover:bg-stone-50 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer shadow-2xs rounded-2xs"
                              title="Cetak Label Packing Pengiriman"
                            >
                              <Printer className="w-3 h-3 text-stone-600" />
                              <span>Label</span>
                            </button>

                            {canCancel && (
                              <>
                                {/* TOMBOL TOLAK DENGAN PENGEMBALIAN STOK */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRejectModal({
                                      show: true,
                                      order: item,
                                      alasan: "Stok Barang Habis",
                                      catatanTambahan: "",
                                      isSubmitting: false,
                                    })
                                  }
                                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold uppercase tracking-wider transition rounded-2xs cursor-pointer"
                                  title="Tolak Pesanan & Kembalikan Stok"
                                >
                                  Tolak
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openStatusModal(
                                      item.id,
                                      item.invoice_no,
                                      "Diproses",
                                      "Verifikasi Pembayaran",
                                    )
                                  }
                                  className="px-3 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer rounded-2xs"
                                >
                                  Verifikasi
                                </button>
                              </>
                            )}

                            {item.status === "Dikirim" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openStatusModal(
                                    item.id,
                                    item.invoice_no,
                                    "Selesai",
                                    "Tandai Selesai",
                                  )
                                }
                                className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold uppercase inline-flex items-center gap-1 transition shadow-2xs cursor-pointer rounded-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Selesai</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal({
                                  show: true,
                                  orderId: item.id,
                                  invoiceNo: item.invoice_no,
                                  isDeleting: false,
                                })
                              }
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xs transition cursor-pointer"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {item.status === "Diproses" && (
                            <div className="flex items-center gap-1 bg-[#FAF8F5] border border-stone-300 p-1 rounded-2xs shadow-2xs">
                              <input
                                type="text"
                                placeholder="Input No. Resi..."
                                value={resiInputs[item.id]?.no_resi || ""}
                                onChange={(e) =>
                                  setResiInputs((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      no_resi: e.target.value,
                                      kurir: item.kurir || "",
                                    },
                                  }))
                                }
                                className="bg-white border border-stone-300 px-2 py-1 text-[10px] font-mono uppercase focus:outline-none focus:border-amber-900 w-32 rounded-2xs"
                              />

                              <button
                                type="button"
                                disabled={isSavingResi[item.id]}
                                onClick={() => handleSimpanResi(item.id)}
                                className="px-2.5 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer disabled:opacity-60 shrink-0 rounded-2xs"
                                title="Simpan Resi & Ubah Status ke Dikirim"
                              >
                                {isSavingResi[item.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Truck className="w-3.5 h-3.5 text-amber-300" />
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
      </div>

      {/* POP-UP MODAL DETAIL LENGKAP PEMBELI */}
      {selectedBuyerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBuyerDetail(null)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
                  <User className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                  Rincian Informasi Pembeli
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBuyerDetail(null)}
                className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Detail Pembeli */}
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  No. Invoice:
                </span>
                <span className="font-mono font-bold text-neutral-950 text-sm">
                  {selectedBuyerDetail.invoice_no}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Nama Penerima:
                </span>
                <p className="font-bold text-neutral-950 text-sm">
                  {selectedBuyerDetail.nama_pembeli}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Nomor WhatsApp / Kontak:
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-neutral-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />+
                    {selectedBuyerDetail.no_hp}
                  </span>
                  <a
                    href={generateWaUrl(selectedBuyerDetail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-300 rounded-2xs transition"
                  >
                    <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                    <span>Chat WA</span>
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Alamat Lengkap Pengiriman:
                </span>
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-2xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>{selectedBuyerDetail.alamat_lengkap}</span>
                </div>
              </div>

              {/* Catatan dari pembeli */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Catatan dari Pembeli:
                </span>
                {selectedBuyerDetail.catatan &&
                selectedBuyerDetail.catatan.trim() ? (
                  <div className="p-2.5 bg-amber-50/90 border border-amber-300 text-amber-950 rounded-2xs flex items-start gap-2 leading-relaxed">
                    <MessageSquareQuote className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <span className="font-medium italic">
                      "{selectedBuyerDetail.catatan.trim()}"
                    </span>
                  </div>
                ) : (
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-2xs text-stone-400 italic">
                    Tidak ada catatan yang disertakan oleh pembeli.
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBuyerDetail(null)}
                className="w-full sm:w-auto px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-2xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOLAK PESANAN & KEMBALIKAN STOK */}
      {rejectModal.show && rejectModal.order && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() =>
              !rejectModal.isSubmitting &&
              setRejectModal({ ...rejectModal, show: false, order: null })
            }
          />

          <div className="relative z-10 bg-white border border-stone-200 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
            {/* Header Modal */}
            <div className="flex items-start gap-3 border-b border-stone-100 pb-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                  Tolak Pesanan & Kembalikan Stok
                </h3>
                <p className="text-[10.5px] text-neutral-500">
                  Invoice:{" "}
                  <strong className="font-mono text-neutral-900">
                    {rejectModal.order.invoice_no}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setRejectModal({ ...rejectModal, show: false, order: null })
                }
                className="text-stone-400 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Peringatan Pengembalian Stok Otomatis */}
            <div className="p-2.5 bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 rounded-2xs space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                Stok Otomatis Dikembalikan:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-900/90">
                {(rejectModal.order.order_items || []).map((i, idx) => (
                  <li key={idx}>
                    {i.nama_produk} ({i.warna || "Default"},{" "}
                    {i.ukuran || "All Size"}) — <strong>+{i.qty} pcs</strong>{" "}
                    dikembalikan ke stok produk.
                  </li>
                ))}
              </ul>
            </div>

            {/* Pilihan Alasan Penolakan */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                Pilih Alasan Penolakan:
              </label>
              <select
                value={rejectModal.alasan}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, alasan: e.target.value })
                }
                className="w-full bg-[#FAF8F5] border border-stone-300 p-2 text-xs font-semibold text-neutral-900 rounded-2xs focus:bg-white focus:outline-none focus:border-amber-900 cursor-pointer"
              >
                <option value="Stok Barang Habis">Stok Barang Habis</option>
                <option value="Bukti Transfer Tidak Valid / Tidak Masuk">
                  Bukti Transfer Tidak Valid / Tidak Masuk
                </option>
                <option value="Nominal Transfer Tidak Sesuai">
                  Nominal Transfer Tidak Sesuai
                </option>
                <option value="Permintaan Pembatalan Oleh Pembeli">
                  Permintaan Pembatalan Oleh Pembeli
                </option>
                <option value="Lainnya">Alasan Lainnya</option>
              </select>
            </div>

            {/* Keterangan Tambahan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                Catatan Tambahan untuk Pembeli (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Tulis pesan jika ada penjelasan tambahan..."
                value={rejectModal.catatanTambahan}
                onChange={(e) =>
                  setRejectModal({
                    ...rejectModal,
                    catatanTambahan: e.target.value,
                  })
                }
                className="w-full bg-[#FAF8F5] border border-stone-300 p-2 text-xs text-neutral-900 rounded-2xs focus:bg-white focus:outline-none focus:border-amber-900"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                disabled={rejectModal.isSubmitting}
                onClick={() =>
                  setRejectModal({ ...rejectModal, show: false, order: null })
                }
                className="px-3.5 py-2 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-2xs hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={rejectModal.isSubmitting}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {rejectModal.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                    <span>Tolak & Hubungi WA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI STATUS */}
      {statusModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() =>
              setStatusModal({
                show: false,
                orderId: null,
                invoiceNo: "",
                targetStatus: "",
                actionLabel: "",
              })
            }
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <PackageCheck className="w-6 h-6 text-amber-800" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                {statusModal.actionLabel}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ubah status pesanan{" "}
                <strong className="font-mono text-neutral-900 break-all">
                  {statusModal.invoiceNo}
                </strong>{" "}
                menjadi{" "}
                <strong className="text-amber-950 font-bold">
                  "{statusModal.targetStatus}"
                </strong>
                ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setStatusModal({
                    show: false,
                    orderId: null,
                    invoiceNo: "",
                    targetStatus: "",
                    actionLabel: "",
                  })
                }
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="w-full py-2.5 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer rounded-2xs"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS PESANAN */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() =>
              !deleteModal.isDeleting &&
              setDeleteModal({
                show: false,
                orderId: null,
                invoiceNo: "",
                isDeleting: false,
              })
            }
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-rose-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                Hapus Pesanan
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus transaksi{" "}
                <strong className="font-mono text-neutral-900 break-all">
                  {deleteModal.invoiceNo}
                </strong>{" "}
                secara permanen?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() =>
                  setDeleteModal({
                    show: false,
                    orderId: null,
                    invoiceNo: "",
                    isDeleting: false,
                  })
                }
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition disabled:opacity-60 cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer rounded-2xs"
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
