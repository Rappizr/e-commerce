// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createPublicServerClient } from "./lib/supabase-public-server";
import { buildProductSlug } from "./lib/product-slug";

export const revalidate = 3600; // revalidate setiap 1 jam

const BASE_URL = "https://almacofashion.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/kebijakan-garansi`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Ambil semua produk publik dari Supabase
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createPublicServerClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("id, nama, updated_at, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("[sitemap] Gagal mengambil produk:", error.message);
    } else if (products && products.length > 0) {
      productPages = products.map((p) => {
        const slug = buildProductSlug(p.id, p.nama || "produk");
        const lastMod = p.updated_at || p.created_at || new Date().toISOString();

        return {
          url: `${BASE_URL}/produk/${slug}`,
          lastModified: new Date(lastMod),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });
    }
  } catch (err) {
    console.error("[sitemap] Error saat generate produk:", err);
  }

  return [...staticPages, ...productPages];
}