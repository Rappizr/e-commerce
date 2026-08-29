'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../penyimpanan/authcontext';
import { supabase } from '../penyimpanan/supabase';
import Footer from '../Footer';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleToggleMode = (loginMode: boolean) => {
    setIsLoginMode(loginMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // 1. PROSES MASUK / LOGIN DENGAN SUPABASE AUTH
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Email atau kata sandi yang Anda masukkan salah.');
        }

        // Ambil data profil pelanggan dari tabel profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama, no_hp, email, alamat')
          .eq('id', authData.user.id)
          .single();

        login({
          name: profile?.nama || formData.email.split('@')[0],
          email: authData.user.email || formData.email,
          phone: profile?.no_hp || '',
        });

        router.push('/profile');
      } else {
        // 2. PROSES DAFTAR AKUN BARU KE SUPABASE AUTH
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              nama: formData.name.trim(),
              no_hp: formData.phone.trim(),
            },
          },
        });

        if (signUpError || !signUpData.user) {
          throw new Error(signUpError?.message || 'Pendaftaran akun gagal. Silakan coba lagi.');
        }

        // Simpan / Sinkronkan data ke tabel profiles
        const formattedPhone = formData.phone.trim().startsWith('0')
          ? '62' + formData.phone.trim().slice(1)
          : formData.phone.trim();

        await supabase.from('profiles').upsert([
          {
            id: signUpData.user.id,
            email: formData.email.trim(),
            nama: formData.name.trim(),
            no_hp: formattedPhone,
            role: 'customer',
          },
        ]);

        login({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formattedPhone,
        });

        setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke halaman profil...');
        setTimeout(() => {
          router.push('/profile');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let pesan = err.message || 'Terjadi kesalahan pada sistem autentikasi.';
      if (pesan.includes('User already registered')) {
        pesan = 'Email ini sudah terdaftar. Silakan pilih tab "Masuk Akun".';
      } else if (pesan.includes('Password should be at least')) {
        pesan = 'Kata sandi minimal harus terdiri dari 6 karakter.';
      } else if (pesan.includes('Invalid login credentials')) {
        pesan = 'Email atau kata sandi tidak sesuai.';
      }
      setErrorMsg(pesan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
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
            <span className="hidden xs:inline">Kembali ke Beranda</span>
            <span className="xs:hidden">Kembali</span>
          </Link>
        </div>
      </header>

      {/* FORM AUTHENTICATION CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
          
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
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wider block mt-0.5">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </div>

          {/* TAB PILIHAN MODE DAFTAR / MASUK */}
          <div className="flex border-b border-neutral-200 mb-5 sm:mb-6 text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2.5 sm:py-3 text-center transition-all border-b-2 ${
                !isLoginMode ? 'border-neutral-950 text-neutral-950 font-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Daftar Baru
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2.5 sm:py-3 text-center transition-all border-b-2 ${
                isLoginMode ? 'border-neutral-950 text-neutral-950 font-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Masuk Akun
            </button>
          </div>

          {/* NOTIFIKASI ERROR / SUKSES */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {!isLoginMode && (
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
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
                  required
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
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
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-10 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] py-3 sm:py-3.5 transition shadow-xs mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoginMode ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}