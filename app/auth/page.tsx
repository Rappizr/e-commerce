"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { supabase } from "../penyimpanan/supabase";
import Footer from "../Footer";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRedirect = searchParams.get("redirect") || "/profile";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // 1. CEK SESI SECARA KETAT & AMAN: Jika user sudah login, langsung lempar ke target/profile
  useEffect(() => {
    let isMounted = true;

    const verifyActiveSession = async () => {
      try {
        // Cek 1: Token sesi aktif dari Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          window.location.replace(targetRedirect);
          return;
        }

        // Cek 2: Tanda login di storage
        const savedEmail = localStorage.getItem("almaco_user_email");
        if (savedEmail && isMounted) {
          // Berikan toleransi singkat untuk memastikan sesi benar-benar sinkron
          const { data: retry } = await supabase.auth.getSession();
          if (retry?.session?.user) {
            window.location.replace(targetRedirect);
            return;
          }
        }

        if (isMounted) {
          setIsCheckingSession(false);
        }
      } catch (err) {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    verifyActiveSession();

    return () => {
      isMounted = false;
    };
  }, [targetRedirect]);

  const handleToggleMode = (loginMode: boolean) => {
    setIsLoginMode(loginMode);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setName(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setErrorMsg("Silakan ketikkan alamat email Anda.");
      return;
    }

    if (!cleanPassword) {
      setErrorMsg("Silakan masukkan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        // PROSES LOGIN
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

        // PERBAIKAN: Tangani error secara terstruktur tanpa throw Error
        if (authError || !authData.session) {
          let pesan = "Email atau kata sandi tidak cocok. Silakan cek kembali.";
          if (authError?.message?.includes("Email not confirmed")) {
            pesan =
              "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk/spam email Anda.";
          } else if (
            authError?.message?.includes("Invalid login credentials")
          ) {
            pesan = "Email atau kata sandi tidak cocok. Silakan cek kembali.";
          } else if (authError?.message) {
            pesan = authError.message;
          }

          setErrorMsg(pesan);
          setIsLoading(false);
          return;
        }

        setSuccessMsg("Berhasil masuk! Mengalihkan...");

        // Simpan tanda login di storage lokal browser
        localStorage.setItem("almaco_user_email", cleanEmail);
        localStorage.setItem("almaco_user_id", authData.user.id);

        // Ambil nama profil dari database untuk disimpan di cache lokal
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("nama")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (prof?.nama) {
            localStorage.setItem("almaco_user_name", prof.nama);
          } else {
            localStorage.setItem(
              "almaco_user_name",
              authData.user.user_metadata?.nama || cleanEmail.split("@")[0],
            );
          }
        } catch (e) {
          localStorage.setItem("almaco_user_name", cleanEmail.split("@")[0]);
        }

        // Pindahkan halaman secara bersih
        setTimeout(() => {
          window.location.replace(targetRedirect);
        }, 200);
      } else {
        // PROSES REGISTER
        const cleanName = name.trim();
        const cleanPhone = phone.trim();
        const formattedPhone = cleanPhone.startsWith("0")
          ? "62" + cleanPhone.slice(1)
          : cleanPhone;

        if (!cleanName) {
          setErrorMsg("Silakan masukkan nama lengkap Anda.");
          setIsLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
              data: {
                nama: cleanName,
                no_hp: formattedPhone,
              },
            },
          });

        if (signUpError) {
          let pesan = signUpError.message || "Gagal mendaftarkan akun.";
          if (pesan.includes("User already registered")) {
            pesan = 'Email sudah terdaftar. Silakan pilih tab "Masuk Akun".';
          }
          setErrorMsg(pesan);
          setIsLoading(false);
          return;
        }

        if (signUpData.session) {
          localStorage.setItem("almaco_user_email", cleanEmail);
          localStorage.setItem("almaco_user_name", cleanName);
          if (signUpData.user) {
            localStorage.setItem("almaco_user_id", signUpData.user.id);
          }
          setSuccessMsg("Pendaftaran berhasil! Mengalihkan...");
          setTimeout(() => {
            window.location.replace(targetRedirect);
          }, 200);
          return;
        }

        setSuccessMsg(
          "Pendaftaran berhasil! Silakan periksa email Anda jika konfirmasi diperlukan, lalu masuk.",
        );
        setIsLoginMode(true);
        setPassword("");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err?.message || "Terjadi kendala autentikasi.");
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <p className="text-xs uppercase tracking-widest font-bold text-neutral-500">
          Memeriksa Status Akun...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span>{" "}
                <span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0 rounded-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs rounded-xs">
          <div className="flex flex-col items-center justify-center text-center mb-5 sm:mb-6 space-y-1">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 mb-1">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-xl sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span>{" "}
                <span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wider block mt-0.5">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </div>

          <div className="flex border-b border-neutral-200 mb-5 sm:mb-6 text-[11px] sm:text-xs uppercase tracking-wider font-bold">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2.5 sm:py-3 text-center transition-all border-b-2 cursor-pointer ${
                !isLoginMode
                  ? "border-neutral-950 text-neutral-950 font-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Daftar Baru
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2.5 sm:py-3 text-center transition-all border-b-2 cursor-pointer ${
                isLoginMode
                  ? "border-neutral-950 text-neutral-950 font-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Masuk Akun
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed rounded-2xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium leading-relaxed rounded-2xs">
              {successMsg}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-3.5 sm:space-y-4"
          >
            {!isLoginMode && (
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Nama Lengkap{" "}
                  <span className="text-red-500">* (Huruf A-Z)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nama Lengkap Anda"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 sm:top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 sm:top-3 pointer-events-none" />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  No WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 sm:top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-10 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white font-mono rounded-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] py-3 sm:py-3.5 transition shadow-xs mt-2 flex items-center justify-center gap-2 cursor-pointer rounded-2xs"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoginMode ? "Masuk Sekarang" : "Daftar Akun"}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
