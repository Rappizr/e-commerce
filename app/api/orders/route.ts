import { NextResponse } from "next/server";
import { createServiceClient } from "../../penyimpanan/supabase-server";

const ORIGIN_SUBDISTRICT_ID =
  process.env.KOMERCE_ORIGIN_SUBDISTRICT_ID || "6170";
const KOMERCE_API_KEY =
  process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_API_KEY || "";

/** Biaya packing per kg (sama seperti di frontend) */
const PACKING_FEE_PER_KG = 3000;

interface OrderItemInput {
  product_id: number;
  qty: number;
  warna?: string | null;
  ukuran?: string | null;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  destination_city_id: string;
  /** kode kurir: jne | jnt | sicepat */
  courier_company: string;
  /** nama layanan: REG, EZ, SIUNTUNG, JTR, GOKIL, dll */
  courier_service: string;
  nama_pembeli: string;
  no_hp: string;
  alamat_lengkap: string;
  search_city_label?: string;
  catatan?: string | null;
  bank_asal: string;
  user_id?: string | null;
}

async function generateInvoiceNumber(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  ).toISOString();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();

  let nextSequence = 1;
  try {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (!error && typeof count === "number") {
      nextSequence = count + 1;
    }
  } catch {
    // fallback sequence 1
  }

  const sequenceStr = String(nextSequence).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSuffix = "";
  for (let i = 0; i < 3; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ORD-${dateStr}${sequenceStr}${randomSuffix}`;
}

/**
 * Hitung ulang ongkir di server dengan memanggil Komerce/RajaOngkir.
 * Tidak percaya harga yang dikirim client.
 */
async function fetchShippingCostServer(
  destinationCityId: string,
  weightGrams: number,
  courierCompany: string,
  courierService: string,
): Promise<{ price: number; courier_name: string; service_name: string }> {
  const totalWeight = Math.max(100, Number(weightGrams) || 350);
  const company = String(courierCompany || "")
    .toLowerCase()
    .trim();
  const serviceWanted = String(courierService || "")
    .toUpperCase()
    .trim()
    .replace(/\s*\(KARGO\)\s*/gi, "")
    .trim();

  // Map display name → kode API
  let apiCourier = "jne";
  if (company.includes("jnt") || company.includes("j&t")) apiCourier = "jnt";
  else if (company.includes("sicepat")) apiCourier = "sicepat";
  else if (company.includes("jne")) apiCourier = "jne";

  try {
    const res = await fetch(
      "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
      {
        method: "POST",
        headers: {
          key: KOMERCE_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          origin: ORIGIN_SUBDISTRICT_ID,
          destination: String(destinationCityId),
          weight: String(totalWeight),
          courier: apiCourier,
        }),
      },
    );

    const json = await res.json();
    const list: any[] = json?.data || [];

    const match = list.find((c: any) => {
      const svc = String(c.service || c.service_name || "")
        .toUpperCase()
        .trim();
      return (
        svc === serviceWanted ||
        svc.includes(serviceWanted) ||
        serviceWanted.includes(svc)
      );
    });

    if (match) {
      const priceValue = Number(
        match.cost ?? match.tariff ?? match.price ?? 0,
      );
      if (priceValue > 0) {
        let displayName = "JNE";
        if (apiCourier === "jnt") displayName = "J&T EXPRESS";
        else if (apiCourier === "sicepat") displayName = "SICEPAT";

        let displayService = String(
          match.service || match.service_name || serviceWanted,
        ).toUpperCase();
        if (displayService === "JTR") displayService = "JTR (KARGO)";
        if (displayService === "GOKIL") displayService = "GOKIL (KARGO)";

        return {
          price: priceValue,
          courier_name: displayName,
          service_name: displayService,
        };
      }
    }
  } catch (err) {
    console.error("Gagal fetch ongkir server:", err);
  }

  // Fallback sama seperti di /api/rajaongkir
  const weightKg = Math.max(1, Math.ceil(totalWeight / 1000));
  const isHeavy = totalWeight >= 10000;

  const fallbacks: Record<
    string,
    { price: number; name: string; service: string }[]
  > = {
    jne: [
      {
        price: 16000 * weightKg,
        name: "JNE",
        service: "REG",
      },
      {
        price: isHeavy ? 45000 + weightKg * 2000 : 50000,
        name: "JNE",
        service: "JTR (KARGO)",
      },
    ],
    jnt: [
      {
        price: 15000 * weightKg,
        name: "J&T EXPRESS",
        service: "EZ",
      },
    ],
    sicepat: [
      {
        price: 15000 * weightKg,
        name: "SICEPAT",
        service: "SIUNTUNG",
      },
      {
        price: isHeavy ? 40000 + weightKg * 2000 : 48000,
        name: "SICEPAT",
        service: "GOKIL (KARGO)",
      },
    ],
  };

  const options = fallbacks[apiCourier] || fallbacks.jne;
  const found =
    options.find(
      (o) =>
        o.service.toUpperCase().includes(serviceWanted) ||
        serviceWanted.includes(o.service.replace(/\s*\(KARGO\)/i, "")),
    ) || options[0];

  return {
    price: found.price,
    courier_name: found.name,
    service_name: found.service,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateOrderBody;

    const {
      items,
      destination_city_id,
      courier_company,
      courier_service,
      nama_pembeli,
      no_hp,
      alamat_lengkap,
      search_city_label,
      catatan,
      bank_asal,
      user_id,
    } = body;

    // ---------- Validasi input dasar ----------
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Daftar produk wajib diisi." },
        { status: 400 },
      );
    }
    if (!destination_city_id) {
      return NextResponse.json(
        { error: "ID destinasi (kota/kecamatan) wajib diisi." },
        { status: 400 },
      );
    }
    if (!courier_company || !courier_service) {
      return NextResponse.json(
        { error: "Pilihan jasa kirim wajib diisi." },
        { status: 400 },
      );
    }
    if (!nama_pembeli?.trim() || !no_hp?.trim() || !alamat_lengkap?.trim()) {
      return NextResponse.json(
        { error: "Data penerima tidak lengkap." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // ---------- Ambil data produk dari DB (jangan percaya client) ----------
    const productIds = [
      ...new Set(
        items
          .map((i) => Number(i.product_id))
          .filter((id) => !isNaN(id) && id > 0),
      ),
    ];

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "Product ID tidak valid." },
        { status: 400 },
      );
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id, nama, harga, stok, berat, is_grosir, min_grosir, harga_grosir, gambar_utama, gambar_list",
      )
      .in("id", productIds);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json(
        { error: "Gagal mengambil data produk dari database." },
        { status: 500 },
      );
    }

    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("product_id, warna, ukuran, stok")
      .in("product_id", productIds);

    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    // ---------- Validasi stok + hitung subtotal & berat di server ----------
    let subtotal = 0;
    let totalWeight = 0;
    const orderItemsPayload: any[] = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const qty = Math.max(1, parseInt(String(item.qty || 1), 10));
      const product = productMap.get(productId);

      if (!product) {
        return NextResponse.json(
          { error: `Produk ID ${productId} tidak ditemukan.` },
          { status: 400 },
        );
      }

      const isGrosir = Boolean(product.is_grosir);
      const minGrosir = Math.max(
        1,
        parseInt(String(product.min_grosir ?? 5), 10),
      );

      // Harga dari DB
      let unitPrice = Number(product.harga || 0);
      if (isGrosir) {
        unitPrice = Number(product.harga_grosir || product.harga || 0);
        if (qty < minGrosir) {
          return NextResponse.json(
            {
              error: `Produk "${product.nama}" minimal order grosir ${minGrosir} pcs.`,
            },
            { status: 400 },
          );
        }
      }

      // Cek stok
      let availableStock = 0;
      if (isGrosir) {
        availableStock = Number(product.stok ?? 0);
      } else {
        const targetColor = String(item.warna || "Default")
          .trim()
          .toUpperCase();
        const targetSize = String(item.ukuran || "All Size")
          .trim()
          .toUpperCase();

        const match = (variantsData || []).find(
          (v: any) =>
            Number(v.product_id) === productId &&
            String(v.ukuran || "")
              .trim()
              .toUpperCase() === targetSize &&
            (String(v.warna || "")
              .trim()
              .toUpperCase() === targetColor ||
              String(v.warna || "")
                .trim()
                .toUpperCase() === "DEFAULT"),
        );

        availableStock = match
          ? Number(match.stok ?? 0)
          : Number(product.stok ?? 0);
      }

      if (qty > availableStock) {
        return NextResponse.json(
          {
            error: `Stok "${product.nama}" tidak mencukupi. Tersedia: ${availableStock} pcs.`,
          },
          { status: 400 },
        );
      }

      const lineSubtotal = unitPrice * qty;
      const weightPerItem = Number(product.berat || 100);

      subtotal += lineSubtotal;
      totalWeight += weightPerItem * qty;

      const gambar =
        product.gambar_utama ||
        (Array.isArray(product.gambar_list) && product.gambar_list[0]) ||
        null;

      orderItemsPayload.push({
        product_id: productId,
        nama_produk: product.nama,
        harga: unitPrice,
        qty,
        warna: item.warna || null,
        ukuran: item.ukuran || null,
        gambar,
        subtotal: lineSubtotal,
      });
    }

    // ---------- Hitung packing fee (server) ----------
    const totalWeightKg =
      totalWeight > 0 ? Math.max(1, Math.ceil(totalWeight / 1000)) : 1;
    const packingFee = totalWeightKg * PACKING_FEE_PER_KG;

    // ---------- Hitung ongkir ulang di server ----------
    const shipping = await fetchShippingCostServer(
      destination_city_id,
      totalWeight,
      courier_company,
      courier_service,
    );

    const shippingFee = shipping.price;
    const calculatedOngkir = shippingFee + packingFee; // sama seperti frontend: ongkir = shipping + packing
    const calculatedTotal = subtotal + calculatedOngkir;

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { error: "Total pesanan tidak valid." },
        { status: 400 },
      );
    }

    // Format WA
    let formattedWa = String(no_hp).trim();
    if (formattedWa.startsWith("0")) {
      formattedWa = "62" + formattedWa.slice(1);
    }

    const kurirFinal = shipping.service_name
      ? `${shipping.courier_name} - ${shipping.service_name}`
      : shipping.courier_name;

    const alamatFinal = search_city_label
      ? `${alamat_lengkap.trim()} (${search_city_label})`
      : alamat_lengkap.trim();

    const inv = await generateInvoiceNumber(supabase);

    // ---------- Insert order (hanya service role) ----------
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user_id || null,
          invoice_no: inv,
          nama_pembeli: nama_pembeli.trim(),
          no_hp: formattedWa,
          alamat_lengkap: alamatFinal,
          status: "Menunggu Pembayaran",
          subtotal,
          ongkir: calculatedOngkir,
          total_harga: calculatedTotal,
          kurir: kurirFinal,
          bank_asal: String(bank_asal || "BCA").toUpperCase(),
          catatan: catatan?.trim() || null,
          berat_total: totalWeight,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Insert order error:", orderError);
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan: " + orderError.message },
        { status: 500 },
      );
    }

    // Attach order_id ke items
    const itemsWithOrderId = orderItemsPayload.map((row) => ({
      ...row,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Insert order_items error:", itemsError);
      // Rollback order jika items gagal
      await supabase.from("orders").delete().eq("id", orderData.id);
      return NextResponse.json(
        { error: "Gagal menyimpan item pesanan: " + itemsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      invoice_no: inv,
      order_id: orderData.id,
      subtotal,
      ongkir: calculatedOngkir,
      total_harga: calculatedTotal,
      kurir: kurirFinal,
    });
  } catch (err: any) {
    console.error("API /api/orders error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Terjadi kesalahan internal saat membuat pesanan.",
      },
      { status: 500 },
    );
  }
}
