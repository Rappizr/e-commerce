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
      // 1. Autentikasi akun ke Katalog Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Email atau password yang Anda masukkan salah.');
      }

      // 2. Validasi Role Admin di tabel `profiles`
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, nama')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        // Keluarkan sesi jika bukan admin
        await supabase.auth.signOut();
        throw new Error('Akses ditolak. Akun ini tidak memiliki hak akses Administrator.');
      }

      // 3. Simpan state sesi admin
      localStorage.setItem('almaco_admin_auth', 'true');
      localStorage.setItem('almaco_admin_user', profile.nama || authData.user.email || 'Admin');
      localStorage.setItem('almaco_admin_login_at', new Date().toISOString());

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col justify-between font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white p-4 sm:p-6">
      
      {/* HEADER TOP */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-black tracking-widest uppercase text-neutral-950 block">ALMACO</span>
            <span className="text-[9px] text-neutral-400 font-bold uppercase">OFFICIAL STORE</span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 bg-white border border-neutral-300 px-3 py-1.5 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ke Toko</span>
        </Link>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-8">
        <div className="bg-white border border-neutral-200 shadow-xl p-6 sm:p-8 space-y-5">
          
          <div className="text-center space-y-1.5 pb-2 border-b border-neutral-100">
            <div className="w-12 h-12 bg-neutral-950 text-white rounded-full flex items-center justify-center mx-auto shadow-md mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-950">
              Autentikasi Admin
            </h1>
            <p className="text-[11px] text-neutral-500">
              Masuk dengan akun admin terdaftar di sistem toko.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 block">
                Email Administrator
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="admin@almacofashion.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-9 pr-3 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-9 pr-10 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-950 font-mono"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-3 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <span>Masuk Ke Dashboard</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest pb-2">
        © 2026 ALMACO FASHION • Hak Cipta Dilindungi
      </div>
    </div>
  );
}