"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/penyimpanan/supabase";
import { Loader2, ShieldAlert } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Abaikan pengecekan jika admin membuka halaman login admin
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    const verifyAdminRole = async () => {
      try {
        setIsLoading(true);

        // 1. Ambil sesi auth aktif dari Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          throw new Error("Sesi tidak ditemukan / kadaluarsa.");
        }

        // 2. Cek Role Admin pada tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          throw new Error("Akses ditolak. Anda bukan Admin.");
        }

        setIsAuthorized(true);
      } catch (err: any) {
        console.error("Akses Admin Ditolak:", err?.message || err);
        setIsAuthorized(false);
        router.replace("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminRole();

    // Listener otomatis jika pengguna Logout / Sesi Habis
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (pathname === "/admin/login") return;

        if (event === "SIGNED_OUT" || !session) {
          setIsAuthorized(false);
          router.replace("/admin/login");
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Jika membuka halaman login admin, langsung tampilkan children
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Tampilan loading saat verifikasi hak akses
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-2 text-neutral-800 w-full">
        <Loader2 className="w-6 h-6 animate-spin text-amber-900" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          Memverifikasi Hak Akses Admin...
        </span>
      </div>
    );
  }

  // Jika bukan Admin, tampilkan peringatan akses ditolak
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 text-center w-full">
        <ShieldAlert className="w-10 h-10 text-rose-600 mb-2" />
        <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Akses Ditolak
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Anda tidak memiliki hak akses untuk membuka halaman ini.
        </p>
      </div>
    );
  }

  return <div className="w-full min-h-screen">{children}</div>;
}
