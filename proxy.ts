import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Lewati semua file aset statis, API, dan rute internal
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Hanya proses jika mengakses /admin KECUALI /admin/login
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 3. Cek flag cookie jika ada
  const allCookies = request.cookies.getAll();
  const hasAuthToken = allCookies.some(
    (c) =>
      c.name.includes("sb-") ||
      c.name.includes("auth-token") ||
      c.name === "almaco_admin_auth",
  );

  // Jika di cookie server belum ada, biarkan lolos ke halaman client
  // Proteksi client-side di halaman /admin akan memverifikasi localStorage & Supabase session secara akurat
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
