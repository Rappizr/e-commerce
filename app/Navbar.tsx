'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, User, Home, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'testimoni', label: 'Testimoni', href: '/#testimoni' },
    { id: 'keranjang', label: 'Keranjang (0)', href: '#keranjang', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', href: '#profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white backdrop-blur-md border-b border-neutral-200/80 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <Link
          href="/"
          onClick={() => setActiveNav('beranda')}
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

        <div className="hidden md:flex items-center relative w-72 lg:w-96 group">
          <input
            type="text"
            placeholder="SEARCH"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-none px-4 py-2 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all duration-300"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none group-focus-within:text-neutral-900 transition-colors duration-200" />
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs tracking-widest uppercase">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`relative py-2 flex items-center gap-1.5 transition-colors duration-300 ${isActive ? 'font-black text-neutral-950' : 'font-semibold text-neutral-500 hover:text-neutral-900'}`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />}
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-neutral-950 transition-all duration-300 ease-out origin-left ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                />
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-900 p-2 transition-transform active:scale-90"
          aria-label="Buka Menu Navigasi"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="SEARCH"
              className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2 text-xs tracking-wider uppercase"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
          </div>
          <div className="flex flex-col space-y-3 text-sm uppercase tracking-wider">
            {navItems.map((item) => {
              const Icon = item.icon || Home;
              const isActive = activeNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 py-1.5 transition-all duration-200 ${isActive ? 'font-bold text-neutral-950 border-l-2 border-neutral-950 pl-2' : 'font-medium text-neutral-600 pl-0'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

