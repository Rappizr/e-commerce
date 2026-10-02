"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  PackageCheck,
  Truck,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";
import { OrderRecordResi } from "./resi";

// Import Sub-Komponen dari folder pesanan-component/
import OrderHeaderFilter from "./pesanan-component/OrderHeaderFilter";
import OrderMobileList from "./pesanan-component/OrderMobileList";
import OrderDesktopTable from "./pesanan-component/OrderDesktopTable";
import ModalBuyerDetail from "./pesanan-component/ModalBuyerDetail";
import ModalRejectOrder from "./pesanan-component/ModalRejectOrder";
import ModalConfirmStatus from "./pesanan-component/ModalConfirmStatus";
import ModalDeleteOrder from "./pesanan-component/ModalDeleteOrder";

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

const formatWaNumber = (noHp: string | number | undefined): string => {
  if (!noHp) return "";
  const raw = String(noHp).replace(/[^0-9]/g, "");
  if (raw.startsWith("0")) return "62" + raw.slice(1);
  if (raw.startsWith("8")) return "62" + raw;
  return raw;
};

export default function PesananComponent() {
  const [orders, setOrders] = useState<OrderRecordResi[]>([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBuyerDetail, setSelectedBuyerDetail] =
    useState<OrderRecordResi | null>(null);

  const [resiInputs, setResiInputs] = useState<{
    [key: number]: { no_resi: string; kurir: string };
  }>({});
  const [isSavingResi, setIsSavingResi] = useState<{ [key: number]: boolean }>(
    {},
  );

  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    order: OrderRecordResi | null;
    alasan: string;
    isSubmitting: boolean;
  }>({
    show: false,
    order: null,
    alasan: "Stok Barang Habis",
    isSubmitting: false,
  });

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

  const handleConfirmReject = async () => {
    const { order, alasan, isSubmitting } = rejectModal;
    if (!order || isSubmitting) return;

    if (order.status === "Dibatalkan") {
      alert("Pesanan ini sudah dibatalkan sebelumnya.");
      return;
    }

    setRejectModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const { error: updateOrderErr } = await supabase
        .from("orders")
        .update({
          status: "Dibatalkan",
          catatan: `Dibatalkan: ${alasan}`,
        })
        .eq("id", order.id);

      if (updateOrderErr) throw updateOrderErr;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "Dibatalkan" } : o,
        ),
      );

      const waUrl = generateWaTolakUrl(order, alasan);
      window.open(waUrl, "_blank");
    } catch (err: any) {
      console.error("Gagal menolak pesanan:", err);
      alert("Gagal menolak pesanan: " + (err.message || err));
    } finally {
      setRejectModal({
        show: false,
        order: null,
        alasan: "Stok Barang Habis",
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
      alert("Gagal memperbarui nomor resi: " + (err.message || err));
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

  const generateWaTolakUrl = (order: OrderRecordResi, alasan: string) => {
    const phone = formatWaNumber(order.no_hp);

    const itemsSummary = (order.order_items || [])
      .map((i) => {
        const warnaLabel =
          i.warna && i.warna !== "Default" ? i.warna : "Sesuai Katalog";
        return `- ${i.nama_produk} (${warnaLabel}, ${i.ukuran || "All Size"}) x${i.qty}`;
      })
      .join("\n");

    const totalFormat = `Rp ${Number(order.total || order.total_harga || 0).toLocaleString("id-ID")}`;

    let penjelasan = "";
    if (alasan === "Stok Barang Habis") {
      penjelasan =
        "Mohon maaf yang sebesar-besarnya, stok busana yang Anda pesan saat ini sedang habis terjual. Jika Anda sudah terlanjur melakukan transfer dana, mohon kirimkan nomor rekening Anda agar dana segera kami kembalikan penuh (Refund 100%).";
    } else if (alasan === "Bukti Transfer Tidak Valid / Tidak Masuk") {
      penjelasan =
        "Kami telah memeriksa mutasi rekening resmi kami, namun dana transfer Anda belum masuk atau foto bukti transfer yang diunggah kurang jelas/tidak terbaca. Mohon kirimkan ulang foto struk mutasi bank Anda melalui chat ini.";
    } else if (alasan === "Nominal Transfer Tidak Sesuai") {
      penjelasan =
        "Nominal dana yang ditransfer belum sesuai dengan total tagihan pesanan Anda. Silakan konfirmasi kekurangan transfer atau hubungi kami untuk penyesuaian pesanan.";
    } else if (alasan === "Permintaan Pembatalan Oleh Pembeli") {
      penjelasan =
        "Pesanan Anda telah resmi kami batalkan sesuai dengan permintaan Anda.";
    } else {
      penjelasan = `Keterangan: ${alasan}. Silakan hubungi kami kembali jika ada pertanyaan.`;
    }

    const lines = [
      `Halo Kak *${order.nama_pembeli}*,`,
      "",
      `Kami dari Admin *ALMACO FASHION* ingin menginformasikan terkait pesanan Anda:`,
      `*No. Invoice:* ${order.invoice_no}`,
      "",
      `*Detail Produk:*`,
      itemsSummary,
      `*Total Tagihan:* ${totalFormat}`,
      "",
      `*Status Pesanan:* *DIBATALKAN / DITOLAK*`,
      "",
      `*Keterangan:*`,
      penjelasan,
      "",
      `Jika ada pertanyaan atau butuh bantuan lebih lanjut, silakan balas pesan ini ya Kak. Terima kasih banyak atas pengertiannya.`,
    ];

    const text = lines.join("\n");
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const generateWaUrl = (item: OrderRecordResi) => {
    if (item.status === "Dibatalkan") {
      return generateWaTolakUrl(item, item.catatan || "Pesanan Dibatalkan");
    }

    const phone = formatWaNumber(item.no_hp);

    const itemsSummary = (item.order_items || [])
      .map((i) => {
        const warnaLabel =
          i.warna && i.warna !== "Default" ? i.warna : "Sesuai Katalog";
        return `- ${i.nama_produk} (${warnaLabel}, ${i.ukuran || "All Size"}) x${i.qty}`;
      })
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
    } else if (item.status === "Dikirim" || item.status === "Selesai") {
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
    } else {
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
      <OrderHeaderFilter
        isLoading={isLoading}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        search={search}
        setSearch={setSearch}
        fetchOrders={fetchOrders}
        filterTabs={filterTabs}
        getFilteredCount={getFilteredCount}
      />

      <OrderMobileList
        isLoading={isLoading}
        filtered={filtered}
        resiInputs={resiInputs}
        setResiInputs={setResiInputs}
        isSavingResi={isSavingResi}
        handleSimpanResi={handleSimpanResi}
        setSelectedBuyerDetail={setSelectedBuyerDetail}
        setDeleteModal={setDeleteModal}
        setRejectModal={setRejectModal}
        openStatusModal={openStatusModal}
        generateWaUrl={generateWaUrl}
        renderStatusBadge={renderStatusBadge}
        WhatsAppIcon={WhatsAppIcon}
      />

      <OrderDesktopTable
        isLoading={isLoading}
        filtered={filtered}
        resiInputs={resiInputs}
        setResiInputs={setResiInputs}
        isSavingResi={isSavingResi}
        handleSimpanResi={handleSimpanResi}
        setSelectedBuyerDetail={setSelectedBuyerDetail}
        setDeleteModal={setDeleteModal}
        setRejectModal={setRejectModal}
        openStatusModal={openStatusModal}
        generateWaUrl={generateWaUrl}
        renderStatusBadge={renderStatusBadge}
        WhatsAppIcon={WhatsAppIcon}
      />

      <ModalBuyerDetail
        selectedBuyerDetail={selectedBuyerDetail}
        setSelectedBuyerDetail={setSelectedBuyerDetail}
        generateWaUrl={generateWaUrl}
        WhatsAppIcon={WhatsAppIcon}
      />

      <ModalRejectOrder
        rejectModal={rejectModal}
        setRejectModal={setRejectModal}
        handleConfirmReject={handleConfirmReject}
        WhatsAppIcon={WhatsAppIcon}
      />

      <ModalConfirmStatus
        statusModal={statusModal}
        setStatusModal={setStatusModal}
        handleConfirmStatusUpdate={handleConfirmStatusUpdate}
      />

      <ModalDeleteOrder
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
