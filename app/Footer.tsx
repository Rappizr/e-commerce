'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, MessageSquare, HelpCircle } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  const pesanWhatsapp = 'Halo Admin ALMACO FASHION, saya ingin bertanya seputar produk dan pemesanan.';
  
  const admin1 = '6285138472520'; 
  const admin2 = '628233510039'; 

  const waUrlAdmin1 = `https://api.whatsapp.com/send?phone=${admin1}&text=${encodeURIComponent(pesanWhatsapp)}`;
  const waUrlAdmin2 = `https://api.whatsapp.com/send?phone=${admin2}&text=${encodeURIComponent(pesanWhatsapp)}`;

  const socialLinks = {
    instagram: 'https://www.instagram.com/almaco_fashion/',
    facebook: 'https://facebook.com/almacofashion',
    telegram: 'https://t.me/almacofashion',
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isUserLoggedIn = 
      typeof window !== 'undefined' && 
      (localStorage.getItem('almaco_user_auth') === 'true' || !!localStorage.getItem('almaco_user_token'));

    if (isUserLoggedIn) {
      router.push('/profile');
    } else {
      router.push('/auth');
    }
  };

  return (
    <footer className="w-full bg-[#EAE7DF] border-t border-neutral-300/80 text-neutral-800 pt-10 sm:pt-14 pb-6 sm:pb-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-14">
          <div className="sm:col-span-2 md:col-span-4 space-y-3 sm:space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-85">
              <div className="relative w-9 h-9 sm:w-12 sm:h-12 shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Almaco Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="leading-none">
                <div className="text-lg sm:text-2xl uppercase tracking-tight text-neutral-950">
                  <span className="font-black">ALMACO</span>
                  <span className="font-light text-neutral-600">FASHION</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block mt-0.5 sm:mt-1">
                  Fashionable • Syari • Berkualitas
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
              Sentuhan rancangan busana modern & modest harian. Didesain dengan presisi dan diproduksi tanpa kompromi demi keanggunan serta kenyamanan Anda.
            </p>

            <div className="space-y-1.5 text-xs text-neutral-600 pt-1 sm:pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Pengiriman dari: <strong>Dusun Jai, RT 02/RW 02, Desa Mergayu, Kec. Bandung, Kab. Tulungagung</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Senin - Sabtu: 08.00 - 21.00 WIB</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 sm:space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900">
              BANTUAN & LAYANAN
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-neutral-600 font-medium">
              <li>
                <Link href="/keranjang" className="hover:text-neutral-950 transition-colors">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/konfirmasi-pembayaran" className="hover:text-neutral-950 transition-colors">
                  Konfirmasi Pembayaran
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="hover:text-neutral-950 transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-xs font-medium text-neutral-600"
                >
                  Akun & Alamat Saya
                </button>
              </li>
              <li>
                <Link href="/faq" className="hover:text-neutral-950 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                  <span>FAQ (Tanya Jawab)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3 sm:space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900">
              ALMACO FASHION
            </h4>
            
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-neutral-600 font-medium">
              <li>
                <Link href="/tentang-kami" className="hover:text-neutral-950 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-garansi" className="hover:text-neutral-950 transition-colors">
                  Kebijakan Garansi & Retur
                </Link>
              </li>
            </ul>

            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900">
                HUBUNGI ADMIN
              </h4>
              
              <a 
                href={waUrlAdmin1} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 group transition-opacity hover:opacity-80 py-0.5"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block group-hover:text-neutral-900">ADMIN 1</span>
                  <span className="text-xs font-bold text-neutral-800 tracking-tight group-hover:underline underline-offset-2">0851-3847-2520</span>
                </div>
              </a>

              <a 
                href={waUrlAdmin2} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 group transition-opacity hover:opacity-80 py-0.5"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block group-hover:text-neutral-900">ADMIN 2</span>
                  <span className="text-xs font-bold text-neutral-800 tracking-tight group-hover:underline underline-offset-2">0823-3510-039</span>
                </div>
              </a>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-3 space-y-5 sm:space-y-6">
            <div className="space-y-2 sm:space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900">
                IKUTI KAMI DI 
              </h4>
              <div className="flex items-center gap-2.5">
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram ALMACO FASHION"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-700 flex items-center justify-center transition-all duration-200 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>

                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook ALMACO"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-700 flex items-center justify-center transition-all duration-200 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>

                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram ALMACO"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-700 flex items-center justify-center transition-all duration-200 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900">
                METODE PEMBAYARAN
              </h4>
              <div className="inline-flex items-center gap-2.5 bg-white p-2 px-3 border border-neutral-300 shadow-xs rounded-[2px]">
                <div className="relative w-12 h-6 border-r border-neutral-200 pr-2 flex items-center justify-center">
                  <Image src="/BCA.png" alt="Bank BCA" fill className="object-contain" />
                </div>
                <div className="leading-tight pl-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                    TRANSFER BANK
                  </span>
                  <span className="text-xs font-bold text-neutral-900 tracking-tight">
                    BCA Virtual Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-300/80 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] tracking-wider uppercase text-neutral-500 text-center sm:text-left">
          <p>© 2026 ALMACO FASHION. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</p>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6">
            <Link href="/kebijakan-privasi" className="hover:text-neutral-950 transition-colors">
              KEBIJAKAN PRIVASI
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-neutral-950 transition-colors">
              SYARAT & KETENTUAN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}