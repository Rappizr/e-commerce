import { NextResponse } from "next/server";
import { createServiceClient } from "../../penyimpanan/supabase-server";

export const runtime = "nodejs";

/** Status yang boleh dikonfirmasi ulang */
const ALLOWED_STATUS_FROM = [
  "Menunggu Pembayaran",
  "Menunggu Verifikasi",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const invoiceNo = String(formData.get("invoice_no") || "").trim();
    const senderName = String(formData.get("nama_pengirim") || "").trim();
    const bankAsal = String(formData.get("bank_asal") || "BCA").trim();
    const file = formData.get("bukti") as File | null;

    if (!invoiceNo) {
      return NextResponse.json(
        { error: "Nomor invoice wajib diisi." },
        { status: 400 },
      );
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "File bukti transfer wajib diunggah." },
        { status: 400 },
      );
    }

    // Batasi ukuran ~5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB." },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus JPG, PNG, atau WEBP." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Cari order berdasarkan invoice_no (atau id numerik)
    let order: {
      id: number;
      invoice_no: string;
      status: string;
      total_harga: number;
    } | null = null;

    const { data: byInvoice } = await supabase
      .from("orders")
      .select("id, invoice_no, status, total_harga")
      .ilike("invoice_no", invoiceNo)
      .maybeSingle();

    if (byInvoice) {
      order = byInvoice;
    } else if (/^\d+$/.test(invoiceNo)) {
      const { data: byId } = await supabase
        .from("orders")
        .select("id, invoice_no, status, total_harga")
        .eq("id", Number(invoiceNo))
        .maybeSingle();
      if (byId) order = byId;
    }

    if (!order) {
      return NextResponse.json(
        {
          error: `Pesanan dengan Invoice "${invoiceNo}" tidak ditemukan.`,
        },
        { status: 404 },
      );
    }

    // Upload ke storage pakai service role (bypass storage RLS)
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const fileName = `bukti_${order.id}_${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabase.storage
      .from("bukti-transfer")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json(
        { error: "Gagal mengunggah bukti transfer: " + uploadErr.message },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("bukti-transfer")
      .getPublicUrl(fileName);

    const buktiUrl = publicUrlData?.publicUrl;
    if (!buktiUrl) {
      return NextResponse.json(
        { error: "Gagal mendapatkan URL publik bukti transfer." },
        { status: 500 },
      );
    }

    // Update order — HANYA field non-harga (service role)
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        bukti_transfer_url: buktiUrl,
        nama_pengirim: senderName || null,
        bank_asal: bankAsal.toUpperCase(),
        status: "Menunggu Verifikasi",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .select("id, invoice_no, status, total_harga, bukti_transfer_url")
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui pesanan: " + updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      order: updated,
      bukti_url: buktiUrl,
    });
  } catch (err: any) {
    console.error("API /api/konfirmasi-pembayaran error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Terjadi kesalahan internal saat konfirmasi pembayaran.",
      },
      { status: 500 },
    );
  }
}
