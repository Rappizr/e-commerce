import { redirect } from "next/navigation";
import { createPublicServerClient } from "../../lib/supabase-public-server";
import { buildProductSlug } from "../../lib/product-slug";

/**
 * Backward-compatible redirect:
 * /product-detail?id=42  →  /produk/nama-produk-42
 */
export default async function LegacyProductDetailRedirect({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const id = Number(sp?.id);

  if (!id || !Number.isFinite(id)) {
    redirect("/");
  }

  const supabase = createPublicServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, nama")
    .eq("id", id)
    .single();

  if (!data) {
    redirect("/");
  }

  const slug = buildProductSlug(data.id, data.nama || "produk");
  redirect(`/produk/${slug}`);
}
