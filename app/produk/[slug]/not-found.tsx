import Link from "next/link";

export default function ProdukNotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 text-center gap-4">
      <h1 className="text-xl font-serif font-bold text-neutral-900">
        Produk Tidak Ditemukan
      </h1>
      <p className="text-sm text-neutral-500 max-w-md">
        Produk yang Anda cari mungkin sudah dihapus atau URL-nya tidak valid.
      </p>
      <Link
        href="/"
        className="inline-block bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition rounded-2xs"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
