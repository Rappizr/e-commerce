'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../penyimpanan/authcontext';
import Footer from '../Footer';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      phone: formData.phone,
    });
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between">
      
      {/* Header Full-Width Rata Tepi seperti Beranda */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Rata Kiri */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-xl sm:text-2xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide block mt-1">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          {/* Tombol Kembali Rata Kanan */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-4 py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

        </div>
      </header>

      {/* Form Pendaftaran & Login */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-neutral-200 p-8 shadow-xs">
          
          {/* Brand Logo & Teks di Atas Kotak Form */}
          <div className="flex flex-col items-center justify-center text-center mb-6 space-y-1">
            <div className="relative w-14 h-14 shrink-0 mb-1">
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
              <span className="text-[10px] text-neutral-400 font-medium tracking-wider block mt-0.5">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </div>

          {/* Tab Pilihan Daftar / Masuk */}
          <div className="flex border-b border-neutral-200 mb-6 text-xs uppercase tracking-widest font-bold">
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-3 text-center transition-all border-b-2 ${
                !isLoginMode ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Daftar Baru
            </button>
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-3 text-center transition-all border-b-2 ${
                isLoginMode ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Masuk Akun
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  No WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-9 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 transition shadow-xs mt-2"
            >
              {isLoginMode ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}