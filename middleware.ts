import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Biarkan request diteruskan.
  // Proteksi rute admin & verifikasi role 'admin' sepenuhnya ditangani oleh AdminLayout & Supabase RLS.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
