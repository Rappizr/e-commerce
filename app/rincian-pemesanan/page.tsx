"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Phone,
    Truck,
    FileText,
    Loader2,
    ImageIcon,
    X,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import Footer from "../Footer";
import { supabase } from "../penyimpanan/supabase";
import { useAuth } from "../penyimpanan/authcontext";

interface OrderItem {
    id: number;
    product_id?: number | null;
    nama_produk: string;
    qty: number;
    warna?: string | null;
    ukuran?: string | null;
    harga: number;
    subtotal: number;
    gambar?: string | null;
}

interface OrderDetail {
    id: number;
    invoice_no: string;
    nama_pembeli: string;
    no_hp: string;
    alamat_lengkap: string;
    status: string;
    subtotal: number;
    ongkir: number;
    total_harga: number;
    no_resi?: string | null;
    kurir?: string | null;
    catatan?: string | null;
    bukti_transfer_url?: string | null;
    nama_pengirim?: string | null;
    bank_asal?: string | null;
    created_at: string;
    order_items: OrderItem[];
}

function statusStyle(status: string) {
    const s = (status || "").toLowerCase();
    if (s.includes("menunggu pembayaran"))
        return "bg-amber-100 text-amber-900 border-amber-300";
    if (s.includes("menunggu verifikasi"))
        return "bg-sky-100 text-sky-900 border-sky-300";
    if (s.includes("ditolak") || s.includes("dibatalkan"))
        return "bg-rose-100 text-rose-800 border-rose-300";
    if (s.includes("dikirim") || s.includes("selesai") || s.includes("lunas"))
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
    return "bg-neutral-100 text-neutral-800 border-neutral-300";
}

function StatusIcon({ status }: { status: string }) {
    const s = (status || "").toLowerCase();
    if (s.includes("ditolak") || s.includes("dibatalkan"))
        return <XCircle className="w-3.5 h-3.5" />;
    if (s.includes("selesai") || s.includes("lunas") || s.includes("dikirim"))
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
}

function RincianContent() {
    const searchParams = useSearchParams();
    const invoiceParam = searchParams.get("invoice") || "";
    
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [previewBukti, setPreviewBukti] = useState(false);
    
    const router = useRouter();
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
    useEffect(() => {
        if (isAuthLoading) return;
        if (!isLoggedIn) {
            const redirectPath = invoiceParam.trim()
                ? `/rincian-pemesanan?invoice=${encodeURIComponent(invoiceParam.trim())}`
                : "/rincian-pemesanan";
            router.replace(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
        }
    }, [isAuthLoading, isLoggedIn, invoiceParam, router]);

    useEffect(() => {
        if (!invoiceParam.trim()) {
            setIsLoading(false);
            setErrorMsg("Nomor invoice tidak ditemukan di URL.");
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            setErrorMsg("");
            const cleanInvoice = invoiceParam.trim();

            try {
                // 1. Ambil data order (tanpa nested relation agar aman dari RLS/FK)
                let { data, error } = await supabase
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
            total_harga,
            no_resi,
            kurir,
            catatan,
            bukti_transfer_url,
            nama_pengirim,
            bank_asal,
            created_at
          `,
                    )
                    .ilike("invoice_no", cleanInvoice)
                    .maybeSingle();

                if ((error || !data) && /^\d+$/.test(cleanInvoice)) {
                    const fallback = await supabase
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
              total_harga,
              no_resi,
              kurir,
              catatan,
              bukti_transfer_url,
              nama_pengirim,
              bank_asal,
              created_at
            `,
                        )
                        .eq("id", Number(cleanInvoice))
                        .maybeSingle();
                    if (fallback.data) data = fallback.data;
                }

                if (!data) {
                    setErrorMsg(
                        `Pesanan dengan invoice "${cleanInvoice}" tidak ditemukan.`,
                    );
                    setOrder(null);
                    return;
                }

                // 2. Ambil barang dari tabel order_items secara terpisah (lebih andal)
                let items: OrderItem[] = [];
                try {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("order_items")
                        .select(
                            "id, order_id, product_id, nama_produk, harga, qty, warna, ukuran, gambar, subtotal",
                        )
                        .eq("order_id", data.id)
                        .order("id", { ascending: true });

                    if (itemsError) {
                        console.error("Fetch order_items error:", itemsError);
                    }

                    if (itemsData && itemsData.length > 0) {
                        items = itemsData.map((it: any) => ({
                            id: it.id,
                            product_id: it.product_id ?? null,
                            nama_produk: it.nama_produk || "Produk",
                            qty: Number(it.qty || 1),
                            warna: it.warna || null,
                            ukuran: it.ukuran || null,
                            harga: Number(it.harga || 0),
                            subtotal: Number(
                                it.subtotal || Number(it.harga || 0) * Number(it.qty || 1),
                            ),
                            gambar: it.gambar || null,
                        }));
                    }
                } catch (itemsErr) {
                    console.error("order_items fetch exception:", itemsErr);
                }

                setOrder({
                    id: data.id,
                    invoice_no: data.invoice_no,
                    nama_pembeli: data.nama_pembeli || "-",
                    no_hp: data.no_hp || "-",
                    alamat_lengkap: data.alamat_lengkap || "-",
                    status: data.status || "-",
                    subtotal: Number(data.subtotal || 0),
                    ongkir: Number(data.ongkir || 0),
                    total_harga: Number(data.total_harga || 0),
                    no_resi: data.no_resi || null,
                    kurir: data.kurir || null,
                    catatan: data.catatan || null,
                    bukti_transfer_url: data.bukti_transfer_url || null,
                    nama_pengirim: data.nama_pengirim || null,
                    bank_asal: data.bank_asal || null,
                    created_at: data.created_at,
                    order_items: items,
                });
            } catch (err) {
                console.error("Fetch rincian pesanan error:", err);
                setErrorMsg("Gagal memuat rincian pesanan. Silakan coba lagi.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [invoiceParam]);

    const isMenungguBayar =
        order?.status === "Menunggu Pembayaran";

    return (
        <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10">
            <div className="text-center max-w-lg mx-auto mb-5 sm:mb-8">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1">
                    DETAIL TRANSAKSI
                </p>
                <h1 className="text-xl sm:text-2xl font-serif uppercase tracking-tight text-neutral-950 font-bold leading-tight">
                    RINCIAN PEMESANAN
                </h1>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
                    Informasi lengkap pesanan, status, dan bukti pembayaran Anda.
                </p>
            </div>

            {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <Loader2 className="w-7 h-7 animate-spin text-neutral-900" />
                    <span className="text-xs font-medium">Memuat rincian pesanan...</span>
                </div>
            ) : errorMsg ? (
                <div className="bg-white border border-neutral-200 p-8 text-center space-y-3 rounded-xs shadow-2xs">
                    <XCircle className="w-10 h-10 mx-auto text-rose-400" />
                    <p className="text-sm font-semibold text-neutral-800">{errorMsg}</p>
                    <Link
                        href="/profile"
                        className="inline-block mt-2 px-4 py-2 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider rounded-2xs"
                    >
                        Kembali ke Profil
                    </Link>
                </div>
            ) : order ? (
                <div className="space-y-4 sm:space-y-5">
                    {/* HEADER STATUS + INVOICE */}
                    <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                    Nomor Invoice
                                </p>
                                <p className="text-sm sm:text-base font-mono font-bold text-neutral-950 tracking-tight">
                                    {order.invoice_no}
                                </p>
                                <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                    Nomor Resi
                                </p>
                                <p className="text-sm sm:text-base font-mono font-bold text-neutral-950 tracking-tight">
                                    {order.no_resi || "Belum ada nomor resi"}
                                </p>
                                <p className="text-[10px] text-neutral-400">
                                    Dibuat pada {new Date(order.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${statusStyle(order.status)}`}
                            >
                                <StatusIcon status={order.status} />
                                {order.status}
                            </span>
                        </div>

                        {isMenungguBayar && (
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                                <Link
                                    href={`/konfirmasi-pembayaran?invoice=${order.invoice_no}`}
                                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-2xs transition"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    Konfirmasi Pembayaran
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                        {/* KOLOM KIRI: Penerima + Alamat + Resi */}
                        <div className="lg:col-span-5 space-y-4">
                            {/* Penerima */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-3">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Data Penerima
                                </h2>
                                <div className="space-y-2.5 text-xs">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                            Nama Penerima
                                        </p>
                                        <p className="font-bold text-neutral-950 mt-0.5">
                                            {order.nama_pembeli}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                            Nomor WhatsApp / HP
                                        </p>
                                        <p className="font-mono font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                            {order.no_hp}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-3">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Alamat Pengiriman
                                </h2>
                                <p className="text-xs text-neutral-700 leading-relaxed">
                                    {order.alamat_lengkap}
                                </p>
                                {order.catatan && order.catatan.trim() && (
                                    <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-2xs text-[11px] text-amber-950 leading-relaxed">
                                        <span className="font-bold uppercase tracking-wider text-[9px] text-amber-700 block mb-0.5">
                                            Catatan Pembeli
                                        </span>
                                        &ldquo;{order.catatan.trim()}&rdquo;
                                    </div>
                                )}
                            </div>

                            {/* Resi & Kurir */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-3">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" />
                                    Pengiriman
                                </h2>
                                <div className="space-y-2.5 text-xs">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                            Ekspedisi
                                        </p>
                                        <p className="font-bold text-neutral-950 mt-0.5 uppercase">
                                            {order.kurir || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                                            Nomor Resi
                                        </p>
                                        {order.no_resi ? (
                                            <p className="font-mono font-bold text-neutral-950 mt-0.5 tracking-wide">
                                                {order.no_resi}
                                            </p>
                                        ) : (
                                            <p className="text-neutral-400 italic mt-0.5 text-[11px]">
                                                Belum ada nomor resi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kontak Bantuan */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs space-y-3">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    Kontak Bantuan
                                </h2>
                                <p className="text-[10px] text-neutral-700 leading-relaxed">
                                    Jika ada pertanyaan terkait pesanan, silakan hubungi kami melalui WhatsApp di{" "}
                                    <a
                                        href="https://wa.me/6281234567890"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-700 font-bold underline"
                                    >
                                        +62 812-3456-7890
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* KOLOM KANAN: Barang + Total + Bukti */}
                        <div className="lg:col-span-7 space-y-4">
                            {/* Barang */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 mb-3 flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5" />
                                    Barang yang Dipesan
                                </h2>

                                {order.order_items.length === 0 ? (
                                    <p className="text-xs text-neutral-400 italic py-4 text-center">
                                        Tidak ada detail barang untuk pesanan ini.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {order.order_items.map((item, idx) => {
                                            const warna =
                                                item.warna &&
                                                    item.warna !== "Default" &&
                                                    item.warna.trim() !== ""
                                                    ? item.warna
                                                    : null;
                                            const ukuran =
                                                item.ukuran && item.ukuran.trim() !== ""
                                                    ? item.ukuran
                                                    : null;
                                            const lineTotal =
                                                item.subtotal || item.harga * item.qty;
                                            const hasProduct =
                                                item.product_id != null && Number(item.product_id) > 0;
                                            const productHref = hasProduct
                                                ? `/product-detail?id=${item.product_id}`
                                                : undefined;

                                            const rowContent = (
                                                <>
                                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-neutral-100 border border-neutral-200 rounded-2xs overflow-hidden">
                                                        {item.gambar ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={item.gambar}
                                                                alt={item.nama_produk}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`text-xs sm:text-[13px] font-bold leading-snug ${hasProduct
                                                                ? "text-neutral-950 group-hover:text-amber-900 group-hover:underline underline-offset-2"
                                                                : "text-neutral-950"
                                                                }`}
                                                        >
                                                            {item.nama_produk}
                                                        </p>
                                                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                                            {warna && (
                                                                <span className="text-[10px] text-neutral-500">
                                                                    Warna:{" "}
                                                                    <strong className="text-neutral-700">
                                                                        {warna}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {ukuran && (
                                                                <span className="text-[10px] text-neutral-500">
                                                                    Ukuran:{" "}
                                                                    <strong className="text-neutral-700">
                                                                        {ukuran}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-neutral-400 mt-1">
                                                            Rp {item.harga.toLocaleString("id-ID")} ×{" "}
                                                            {item.qty} pcs
                                                        </p>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">
                                                            Subtotal
                                                        </span>
                                                        <span className="text-xs sm:text-sm font-mono font-bold text-neutral-900">
                                                            Rp {lineTotal.toLocaleString("id-ID")}
                                                        </span>
                                                    </div>
                                                </>
                                            );

                                            if (hasProduct && productHref) {
                                                return (
                                                    <Link
                                                        key={item.id || idx}
                                                        href={productHref}
                                                        className="group py-3 flex items-start gap-3 transition-colors hover:bg-neutral-50 -mx-1 px-1 rounded-2xs cursor-pointer"
                                                        title={`Lihat detail: ${item.nama_produk}`}
                                                    >
                                                        {rowContent}
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={item.id || idx}
                                                    className="py-3 flex items-start gap-3"
                                                >
                                                    {rowContent}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Ringkasan total */}
                                {(() => {
                                    const itemsSubtotal = order.order_items.reduce(
                                        (acc, it) =>
                                            acc + (it.subtotal || it.harga * it.qty),
                                        0,
                                    );
                                    const displaySubtotal =
                                        order.subtotal > 0 ? order.subtotal : itemsSubtotal;
                                    const displayTotal =
                                        order.total_harga > 0
                                            ? order.total_harga
                                            : displaySubtotal + order.ongkir;

                                    return (
                                        <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1.5 text-xs">
                                            <div className="flex justify-between text-neutral-600">
                                                <span>
                                                    Subtotal Barang
                                                    {order.order_items.length > 0 && (
                                                        <span className="text-neutral-400">
                                                            {" "}
                                                            ({order.order_items.reduce((a, i) => a + i.qty, 0)}{" "}
                                                            pcs)
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-mono">
                                                    Rp {displaySubtotal.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-neutral-600">
                                                <span>Ongkos Kirim</span>
                                                <span className="font-mono">
                                                    Rp {order.ongkir.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-1.5 border-t border-neutral-100">
                                                <span className="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">
                                                    Total
                                                </span>
                                                <span className="text-sm sm:text-base font-mono font-black text-amber-950">
                                                    Rp {displayTotal.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Bukti Transfer */}
                            <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-2xs rounded-xs">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 mb-3 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Bukti Pembayaran
                                </h2>

                                {order.bukti_transfer_url ? (
                                    <div className="space-y-3">
                                        {(order.nama_pengirim || order.bank_asal) && (
                                            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600">
                                                {order.nama_pengirim && (
                                                    <span>
                                                        Pengirim:{" "}
                                                        <strong className="text-neutral-900">
                                                            {order.nama_pengirim}
                                                        </strong>
                                                    </span>
                                                )}
                                                {order.bank_asal && (
                                                    <span>
                                                        Bank:{" "}
                                                        <strong className="text-neutral-900">
                                                            {order.bank_asal}
                                                        </strong>
                                                    </span>
                                                )}
                                                {order.status === "Menunggu Verifikasi" ? (
                                                    <span className="text-rose-600 font-bold">
                                                        Pembayaran Belum Dikonfirmasi
                                                    </span>
                                                ) : order.status === "Diproses" ? (<span className="text-emerald-600 font-bold">
                                                    Pembayaran Terverifikasi
                                                </span>) : order.status === "Selesai" ? (
                                                    <span className="text-emerald-600 font-bold">
                                                        Pembayaran Terverifikasi
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setPreviewBukti(true)}
                                            className="relative w-full aspect-[4/3] max-h-56 bg-neutral-50 border border-neutral-200 rounded-2xs overflow-hidden cursor-pointer group"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={order.bukti_transfer_url}
                                                alt="Bukti transfer"
                                                className="w-full h-full object-contain group-hover:opacity-90 transition"
                                            />
                                            <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-black/70 text-white px-2 py-1 rounded-2xs">
                                                Klik untuk perbesar
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center space-y-2">
                                        <ImageIcon className="w-8 h-8 mx-auto text-neutral-300" />
                                        <p className="text-xs text-neutral-500">
                                            Belum ada bukti pembayaran yang diunggah.
                                        </p>
                                        {isMenungguBayar && (
                                            <Link
                                                href={`/konfirmasi-pembayaran?invoice=${order.invoice_no}`}
                                                className="inline-block mt-1 text-[11px] font-bold text-rose-600 hover:underline uppercase tracking-wider"
                                            >
                                                Unggah Bukti Sekarang →
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Modal preview bukti */}
            {previewBukti && order?.bukti_transfer_url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                        onClick={() => setPreviewBukti(false)}
                    />
                    <div className="relative z-10 w-full max-w-2xl bg-white border border-neutral-200 shadow-2xl rounded-xs overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                                Bukti Transfer — {order.invoice_no}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewBukti(false)}
                                className="p-1 text-neutral-400 hover:text-neutral-900"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-3 sm:p-4 bg-neutral-50 flex items-center justify-center max-h-[75vh] overflow-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={order.bukti_transfer_url}
                                alt="Bukti transfer full"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function RincianPemesananPage() {
    return (
        <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
                <div className="w-full px-3.5 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0"
                    >
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                            <Image
                                src="/logo.png"
                                alt="Almaco Logo"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                        <div className="leading-tight truncate">
                            <div className="text-sm sm:text-base uppercase tracking-tight text-neutral-950">
                                <span className="font-black">ALMACO</span>{" "}
                                <span className="font-light">FASHION</span>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kembali ke Profil</span>
                        <span className="sm:hidden">Profil</span>
                    </Link>
                </div>
            </header>

            <Suspense
                fallback={
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="w-7 h-7 animate-spin text-neutral-400" />
                    </div>
                }
            >
                <RincianContent />
            </Suspense>

            <Footer />
        </div>
    );
}
