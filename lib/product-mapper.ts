/** Shared types & mapping logic for product data */

export interface VariantItem {
  id: number;
  product_id: number;
  warna: string;
  ukuran: string;
  stok: number;
}

export interface ProductMapped {
  id: string;
  title: string;
  category: string;
  price: string;
  rawPrice: number;
  stok: number;
  weight: number;
  desc: string;
  is_grosir: boolean;
  min_grosir: number;
  harga_grosir: number | null;
  images: string[];
  warna: string[];
  ukuran: string;
  details: string[];
}

export function mapProductRow(data: any): ProductMapped {
  const isGrosir = Boolean(data.is_grosir);
  const minGrosirVal = isGrosir
    ? Math.max(2, Number(data.min_grosir) || 5)
    : 1;

  let imgList: string[] = [];
  if (Array.isArray(data.gambar_list) && data.gambar_list.length > 0) {
    imgList = data.gambar_list.filter(Boolean);
  } else if (data.gambar_utama) {
    imgList = [data.gambar_utama];
  } else {
    imgList = [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
    ];
  }

  const warnaArr: string[] = isGrosir
    ? ["Seri Mix (Campur Warna)"]
    : Array.isArray(data.warna) && data.warna.length > 0
      ? data.warna
      : ["Default"];

  const ukuranTunggal =
    Array.isArray(data.ukuran) && data.ukuran.length > 0
      ? data.ukuran[0]
      : typeof data.ukuran === "string" && data.ukuran.trim() !== ""
        ? data.ukuran
        : "All Size (LD 115 cm)";

  const detailsArr: string[] =
    Array.isArray(data.rincian) && data.rincian.length > 0
      ? data.rincian
      : isGrosir
        ? [
            `Paket seri otomatis isi ${minGrosirVal} pcs beda warna`,
            "Bahan adem & jahitan konveksi rapi",
          ]
        : [
            "Bahan premium super adem & lembut",
            "Jahitan rapi standar konveksi ALMACO",
          ];

  return {
    id: String(data.id),
    title: data.nama || "Busana Almaco",
    category: data.kategori || "Busana",
    price: `Rp ${Number(data.harga || 0).toLocaleString("id-ID")}`,
    rawPrice: Number(data.harga || 0),
    stok: typeof data.stok === "number" ? data.stok : 0,
    weight: Number(data.berat || 100),
    desc:
      data.deskripsi ||
      (isGrosir
        ? "Paket grosir busana seri campur warna langsung dari konveksi ALMACO FASHION."
        : "Busana modis berkualitas premium dari ALMACO FASHION."),
    is_grosir: isGrosir,
    min_grosir: minGrosirVal,
    harga_grosir: isGrosir ? Number(data.harga_grosir || data.harga) : null,
    images: imgList,
    warna: warnaArr,
    ukuran: ukuranTunggal,
    details: detailsArr,
  };
}

export function mapVariants(
  variantData: any[] | null,
  product: ProductMapped,
): VariantItem[] {
  return (variantData || []).map((v: any) => ({
    id: Number(v.id),
    product_id: Number(v.product_id),
    warna: String(
      v.warna ||
        (product.is_grosir ? "Seri Mix (Campur Warna)" : "Default"),
    ).trim(),
    ukuran: String(v.ukuran || product.ukuran).trim(),
    stok: Number(v.stok ?? 0),
  }));
}
