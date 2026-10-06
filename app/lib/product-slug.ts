/**
 * Utility slug produk untuk URL SEO-friendly.
 * Format: {nama-slug}-{id}  contoh: gamis-premium-elegan-42
 */

export function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Bangun slug dari nama + id produk */
export function buildProductSlug(id: number | string, nama: string): string {
  const base = slugify(nama) || "produk";
  return `${base}-${id}`;
}

/** Ambil ID numerik dari akhir slug (setelah tanda hubung terakhir) */
export function parseProductIdFromSlug(slug: string): number | null {
  if (!slug) return null;
  const match = String(slug).match(/-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Path relatif produk */
export function productPath(id: number | string, nama: string): string {
  return `/produk/${buildProductSlug(id, nama)}`;
}
