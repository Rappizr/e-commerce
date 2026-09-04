'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
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
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanPhone = formData.phone.trim();
      const formattedPhone = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.slice(1)
        : cleanPhone;

      if (isLoginMode) {
        // 1. PROSES MASUK (LOGIN)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password,
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Email atau kata sandi tidak sesuai.');
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('nama, no_hp, email, alamat')
          .eq('id', authData.user.id)
          .single();

        login({
          id: authData.user.id,
          name: profile?.nama || cleanEmail.split('@')[0],
          email: authData.user.email || cleanEmail,
          phone: profile?.no_hp || '',
        });

        router.push('/profile');
      } else {
        // 2. PROSES DAFTAR (SIGN UP)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: formData.password,
          options: {
            data: {
              nama: formData.name.trim(),
              no_hp: formattedPhone,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error('Pendaftaran akun gagal. Silakan coba lagi.');
        }

        // Simpan / Sinkronkan data ke tabel profiles
        const { error: profileError } = await supabase.from('profiles').upsert([
          {
            id: signUpData.user.id,
            email: cleanEmail,
            nama: formData.name.trim(),
            no_hp: formattedPhone,
            role: 'customer',
          },
        ]);

        if (profileError) {
          console.error('Gagal menyimpan baris profile:', profileError);
        }

        login({
          id: signUpData.user.id,
          name: formData.name.trim(),
          email: cleanEmail,
          phone: formattedPhone,
        });

        setSuccessMsg('Akun berhasil didaftarkan! Mengalihkan...');
        setTimeout(() => {
          router.push('/profile');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      let pesan = err.message || 'Terjadi kendala pada sistem autentikasi.';

      if (pesan.includes('Signups not allowed') || pesan.includes('signups are disabled')) {
        pesan = 'Pendaftaran akun baru saat ini dinonaktifkan di dashboard Supabase. Aktifkan opsi "Allow new users to sign up" pada menu Auth Providers.';
      } else if (pesan.includes('rate limit')) {
        pesan = 'Terlalu banyak percobaan. Harap tunggu beberapa saat lagi.';
      } else if (pesan.includes('User already registered')) {
        pesan = 'Email ini sudah terdaftar. Silakan pilih tab "Masuk Akun".';
      } else if (pesan.includes('Password should be at least')) {
        pesan = 'Kata sandi minimal harus terdiri dari 6 karakter.';
      } else if (pesan.includes('Invalid login credentials')) {
        pesan = 'Email atau kata sandi tidak cocok.';
      }

      setErrorMsg(pesan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200/80">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-base sm:text-lg tracking-tight uppercase">
                <span className="font-extrabold text-neutral-950">ALMACO</span>
                <span className="font-light text-neutral-400">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-normal tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-neutral-900 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 sm:px-5 py-2 sm:py-2.5 transition-colors duration-200 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BELANJA</span>
          </Link>
        </div>
      </header>

      {/* FORM AUTHENTICATION */}
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

          {/* TAB MODE */}
          <div className="flex border-b border-neutral-200 mb-5 sm:mb-6 text-[11px] sm:text-xs uppercase tracking-wider font-bold">
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