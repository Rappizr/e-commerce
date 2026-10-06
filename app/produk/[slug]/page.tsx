import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { createPublicServerClient } from "../../../lib/supabase-public-server";
import {
  parseProductIdFromSlug,
  buildProductSlug,
} from "../../../lib/product-slug";
import { mapProductRow, mapVariants } from "../../../lib/product-mapper";
import ProductDetailClient from "./ProductDetailClient";
import ProductJsonLd from "../../../components/ProductJsonLd";
import BreadcrumbJsonLd from "../../../components/BreadcrumbJsonLd";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

async function loadProduct(slug: string) {
  const id = parseProductIdFromSlug(slug);
  if (!id) return null;

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, nama, kategori, harga, stok, berat, deskripsi, is_grosir, min_grosir, harga_grosir, gambar_list, gambar_utama, gambar_url, warna, ukuran, rincian",
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const product = mapProductRow(data);
  const canonicalSlug = buildProductSlug(data.id, data.nama || "produk");
  // gambar_url khusus untuk share link (OG / Twitter), bukan gambar_utama / gambar_list
  const shareImageUrl =
    typeof data.gambar_url === "string" && data.gambar_url.trim() !== ""
      ? data.gambar_url.trim()
      : "";

  const { data: variantData } = await supabase
    .from("product_variants")
    .select("id, product_id, warna, ukuran, stok")
    .eq("product_id", id);

  const variants = mapVariants(variantData, product);
  return { product, variants, canonicalSlug, shareImageUrl };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadProduct(slug);

  if (!result) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Produk yang Anda cari tidak tersedia di ALMACO FASHION.",
      robots: { index: false, follow: false },
    };
  }

  const { product, canonicalSlug, shareImageUrl } = result;
  const title = product.title;
  const description =
    product.desc.slice(0, 155) + (product.desc.length > 155 ? "…" : "");
  // Share link (OG / Twitter) hanya memakai gambar_url, bukan gambar_utama / gambar_list
  const ogImage = shareImageUrl || "";
  const canonical = `/produk/${canonicalSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ALMACO FASHION`,
      description,
      url: `https://almacofashion.com${canonical}`,
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ALMACO FASHION`,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: title,
            },
          ]
        : [],
    },
  };
}

export default async function ProdukPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadProduct(slug);

  if (!result) {
    notFound();
  }

  const { product, variants, canonicalSlug } = result;

  if (slug !== canonicalSlug) {
    permanentRedirect(`/produk/${canonicalSlug}`);
  }

  const canonicalUrl = `https://almacofashion.com/produk/${canonicalSlug}`;

  return (
    <>
      <ProductJsonLd product={product} url={canonicalUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: "https://almacofashion.com" },
          { name: product.category, url: "https://almacofashion.com/#katalog" },
          { name: product.title, url: canonicalUrl },
        ]}
      />
      <ProductDetailClient
        initialProduct={product}
        initialVariants={variants}
      />
    </>
  );
}