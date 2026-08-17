'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, User, Home, Menu, X } from 'lucide-react';
import { useKeranjang } from './penyimpanan/KeranjangContext';


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');
  const { totalCount } = useKeranjang();


  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'testimoni', label: 'Testimoni', href: '/#testimoni' },
    { id: 'keranjang', label: `Keranjang (${totalCount})`, href: '/keranjang', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', href: '#profile', icon: User },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);

    if (href.includes('#')) {
      const targetId = href.split('#')[1];
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href === '/') {
      const elem = document.getElementById('beranda');
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-2 font-medium text-xs tracking-widest uppercase"
              aria-label="Buka Side Menu"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">MENU</span>
            </button>

            <Link
              href="/"
              onClick={(e) => handleNavClick(e, '/', 'beranda')}
              className="flex items-center gap-3 transition-transform duration-300 hover:opacity-85 active:scale-95"
            >
              <div className="relative w-9 h-9 overflow-hidden rounded-full border border-neutral-200 shadow-sm">
                <Image
                  src="/LOGO.jpeg"
                  alt="Almaco Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-widest text-neutral-900 uppercase">
                ALMACO FASHION
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative w-64 lg:w-80 group">
              <input
                type="text"
                placeholder="SEARCH"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-none px-4 py-2 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all duration-300"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none group-focus-within:text-neutral-900 transition-colors duration-200" />
            </div>

            <Link
              href="/keranjang"
              className="p-2 text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>


      {/* Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION DRAWER */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-white border-r border-neutral-200 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Top Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-neutral-200">
              <Image
                src="/LOGO.jpeg"
                alt="Almaco Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-base font-black tracking-widest text-neutral-900 uppercase">
              ALMACO
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-all"
            aria-label="Tutup Menu Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 mb-4">
            NAVIGASI UTAMA
          </p>

          {navItems.map((item) => {
            const Icon = item.icon || Home;
            const isActive = activeNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-all rounded-md ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-6 border-t border-neutral-100 space-y-4 bg-neutral-50/50">
          <Link
            href="/tentang-kami"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:text-neutral-950 transition"
          >
            TENTANG ALMACO FASHION →
          </Link>
          <p className="text-[10px] tracking-wider uppercase text-neutral-400">
            © 2026 ALMACO. ALL RIGHTS RESERVED.
          </p>
        </div>
      </aside>
    </>
  );
}



