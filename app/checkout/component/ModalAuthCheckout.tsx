"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

interface ModalAuthCheckoutProps {
  show: boolean;
}

export default function ModalAuthCheckout({ show }: ModalAuthCheckoutProps) {
  const router = useRouter();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300" />

      <div className="relative z-10 w-full max-w-md bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200 rounded-xs">
        <div className="w-14 h-14 rounded-full bg-neutral-950 text-amber-400 border border-neutral-800 flex items-center justify-center mx-auto shadow-md">
          <LogIn className="w-6 h-6 ml-0.5" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-950">
            Masuk atau Daftar Akun
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Untuk melanjutkan transaksi dan menyimpan alamat pengiriman Anda,
            silakan masuk ke akun Anda terlebih dahulu.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/auth?mode=login&redirect=/checkout")}
            className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 transition-colors shadow-sm cursor-pointer rounded-2xs flex items-center justify-center gap-2"
          >
            <span>Masuk Akun (Login)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/auth?mode=register&redirect=/checkout")
            }
            className="w-full bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-950 text-neutral-800 text-xs font-bold uppercase tracking-[0.15em] py-3.5 transition-colors cursor-pointer rounded-2xs"
          >
            <span>Daftar Akun Baru</span>
          </button>

          <Link
            href="/keranjang"
            className="block text-[11px] text-neutral-400 hover:text-neutral-700 underline underline-offset-4 font-medium pt-1 transition-colors"
          >
            Kembali ke Keranjang
          </Link>
        </div>
      </div>
    </div>
  );
}
