'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#E6E3DA] border-t border-neutral-300/70 pt-16 pb-12 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-3xl font-black tracking-tight uppercase text-neutral-950">
              ALMACO FASHION
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
              Sentuhan rancangan arsitektural untuk kepribadian modern. Didesain dengan presisi dan diproduksi tanpa kompromi.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              BELANJA
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-700">
              <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Pria</Link></li>
              <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Wanita</Link></li>
              <li><Link href="/" className="hover:text-neutral-950 transition-colors duration-200">Aksesori</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              TENTANG KAMI
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-700">
              <li><Link href="/tentang-kami" className="hover:text-neutral-950 transition-colors duration-200 font-bold">Tentang Kami</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] tracking-wider uppercase text-neutral-400">
          <p>© 2026 ALMACO. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-neutral-700 transition-colors duration-200">KEBIJAKAN PRIVASI</Link>
            <Link href="#" className="hover:text-neutral-700 transition-colors duration-200">SYARAT & KETENTUAN</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


