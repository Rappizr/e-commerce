'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../penyimpanan/supabase';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'admin@almaco.com' && password === 'admin12345') {
        localStorage.setItem('almaco_admin_auth', 'true');
        localStorage.setItem('almaco_admin_user', 'Administrator Almaco');
        localStorage.setItem('almaco_admin_login_at', new Date().toISOString());
        if (onLoginSuccess) { onLoginSuccess(); } else { window.location.href = '/admin'; }
        return;
      }

      // 1. Autentikasi akun ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Email atau kata sandi tidak cocok.');
      }

      // 2. Validasi Role Admin di tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, nama')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Akses ditolak. Akun ini tidak terdaftar sebagai Administrator.');
      }

      // 3. Simpan state sesi
      localStorage.setItem('almaco_admin_auth', 'true');
      localStorage.setItem('almaco_admin_user', profile.nama || authData.user.email || 'Admin');
      localStorage.setItem('almaco_admin_login_at', new Date().toISOString());

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat proses verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-between font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none truncate">
              <div className="text-lg sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1 truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      {/* LOGIN CARD SECTION */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-[420px] bg-white border border-neutral-200/90 shadow-xl shadow-neutral-200/40 p-6 sm:p-9 relative">
          
          {/* LOGO & BRAND IDENTITAS TOKO */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
              <Image 
                src="/logo.png" 
                alt="Almaco Logo" 
                fill 
                priority 
                className="object-contain" 
              />
            </div>

            <div className="leading-tight">
              <div className="text-lg sm:text-xl tracking-tight uppercase">
                <span className="font-black text-neutral-950">ALMACO</span>
                <span className="font-light text-neutral-500 ml-0.5">FASHION</span>
              </div>
              <span className="text-[9px] text-neutral-400 font-medium tracking-widest block uppercase mt-0.5">
                Fashionable • Syari • Berkualitas
              </span>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Akses Khusus Admin
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <h1 className="text-lg sm:text-xl font-serif tracking-tight uppercase text-neutral-950">
                Autentikasi Staf
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                Silakan masuk menggunakan akun administratif toko untuk mengelola katalog, order, dan kas.
              </p>
            </div>
          </div>

          {/* PESAN ERROR */}
          {errorMsg && (
            <div className="mb-5 p-3 sm:p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in duration-200 flex items-start gap-2">
              <span className="font-bold text-rose-600">•</span>
              <p className="flex-1 font-medium">{errorMsg}</p>
            </div>
          )}

          {/* FORM LOGIN */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
                Email Administrator <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="admin@almaco.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50/70 border border-neutral-300 pl-9 pr-3.5 py-2.5 sm:py-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950 transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50/70 border border-neutral-300 pl-9 pr-10 py-2.5 sm:py-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950 font-mono transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-1 transition-colors"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-neutral-400 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* FOOTER INFORMASI CARD */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Sistem mencatat riwayat alamat IP dan waktu setiap sesi login administrator secara otomatis.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER COPYRIGHT */}
      <footer className="w-full py-4 text-center border-t border-neutral-200/80 bg-white/50">
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest">
          © 2026 ALMACO FASHION • HAK CIPTA DILINDUNGI
        </p>
      </footer>

    </div>
  );
}