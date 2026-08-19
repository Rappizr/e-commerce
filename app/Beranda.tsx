'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronDown, 
  ShoppingBag, 
  Search, 
  User, 
  Home, 
  UserPlus, 
  Menu, 
  X 
} from 'lucide-react';
import { useKeranjang } from './penyimpanan/KeranjangContext';
import Footer from './Footer';

export default function Beranda() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { cartItems } = useKeranjang();
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const savedUser = localStorage.getItem('almaco_user');
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const noWhatsapp = '628883199088';
  const pesanWhatsapp = 'Halo Admin ALMACO FASHION, saya tertarik dan ingin bertanya mengenai katalog produk terbaru.';
  const waUrl = `https://wa.me/${noWhatsapp}?text=${encodeURIComponent(pesanWhatsapp)}`;

  const brandTicker = Array(12).fill('ALMACO FASHION');
  const deliveryTicker = Array(12).fill('TESTIMONI PENGIRIMAN');

  const categories = ['Semua', 'Daster', 'Gamis', 'Setcel', 'Best Seller'];

  const products = [
    {
      id: 1,
      title: 'Daster Arab Renda Rayon Premium',
      category: 'Daster',
      price: 'Rp 115.000',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      badge: 'Best Seller',
    },
    {
      id: 2,
      title: 'Daster Midi Floral Rayon Adem',
      category: 'Daster',
      price: 'Rp 89.000',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
      badge: 'Favorit',
    },
    {
      id: 3,
      title: 'Daster Kaftan Siluet Minimalis',
      category: 'Daster',
      price: 'Rp 135.000',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      badge: 'Terbaru',
    },
    {
      id: 4,
      title: 'Gamis Abaya Silk Polos Elegan',
      category: 'Gamis',
      price: 'Rp 275.000',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      badge: 'Eksklusif',
    },
    {
      id: 5,
      title: 'Daster Panjang Twill Busui Friendly',
      category: 'Daster',
      price: 'Rp 105.000',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      badge: 'Promo',
    },
    {
      id: 6,
      title: 'Setcel Knit Crinkle Kulot',
      category: 'Setcel',
      price: 'Rp 189.000',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop',
      badge: 'Hot Item',
    },
    {
      id: 7,
      title: 'Gamis Tiered Dress Pastel Mewah',
      category: 'Gamis',
      price: 'Rp 299.000',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      badge: 'Premium',
    },
    {
      id: 8,
      title: 'Setcel Rayon Motif Tie Dye Harian',
      category: 'Setcel',
      price: 'Rp 165.000',
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
      badge: 'Best Seller',
    },
  ];

  const testimonialImages = [
    { image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', alt: 'Paket 1' },
    { image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop', alt: 'Paket 2' },
    { image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop', alt: 'Paket 3' },
    { image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', alt: 'Paket 4' },
    { image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop', alt: 'Paket 5' },
  ];

  return (
    <main id="beranda" className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white scroll-smooth relative flex flex-col justify-between">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 26s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
  {/* Ikon Tas Lebih Dekat ke Teks */}
  <div className="relative w-11 h-11 sm:w-16 sm:h-16 shrink-0">
    <Image
      src="/logo.png"
      alt="Almaco Logo"
      fill
      priority
      className="object-contain"
    />
  </div>
  
  {/* ALMACOFASHION Menyatu Tanpa Spasi */}
  <div className="leading-none">
    <div className="text-xl sm:text-2xl uppercase tracking-tight text-neutral-950">
      <span className="font-black">ALMACO</span><span className="font-light text-neutral-600">FASHION</span>
    </div>
    <span className="text-[10px] text-neutral-400 font-medium tracking-wide block mt-1">
      Fashionable • Syari • Berkualitas
    </span>
  </div>
</Link>

          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-6 items-center relative">
            <input
              type="text"
              placeholder="SEARCH..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-none px-4 py-2.5 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white transition-all duration-200"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 shrink-0">
            <nav className="hidden lg:flex items-center space-x-6 text-xs tracking-[0.15em] uppercase font-bold text-neutral-700">
              <Link
                href="/"
                className="hover:text-neutral-950 transition-colors py-1 flex items-center gap-1.5"
              >
                <span>Beranda</span>
              </Link>

              <Link
                href="/#testimoni"
                className="hover:text-neutral-950 transition-colors py-1"
              >
                Testimoni
              </Link>
            </nav>

            <Link
              href="/keranjang"
              className="group flex items-center gap-2 p-1 text-neutral-800 hover:text-neutral-950 transition-colors"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="sm:hidden absolute -top-1.5 -right-2 w-4 h-4 bg-neutral-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-[0.15em]">
                Keranjang
              </span>
              <span className="hidden sm:inline-flex items-center justify-center bg-neutral-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px]">
                {totalCartCount}
              </span>
            </Link>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-1 text-neutral-800 hover:text-neutral-950 transition-colors text-xs font-bold uppercase tracking-[0.15em]"
              >
                <User className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 p-1 text-neutral-800 hover:text-neutral-950 transition-colors text-xs font-bold uppercase tracking-[0.15em]"
              >
                <UserPlus className="w-4.5 h-4.5" />
                <span>Daftar | Login</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-900 border border-neutral-300"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-6 py-5 space-y-3">
            <div className="relative w-full mb-3 md:hidden">
              <input
                type="text"
                placeholder="SEARCH..."
                className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs tracking-wider uppercase"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 border-b border-neutral-100"
            >
              Beranda
            </Link>
            <Link
              href="/#testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 border-b border-neutral-100"
            >
              Testimoni
            </Link>
          </div>
        )}
      </header>

      <section className="relative h-[45vh] w-full flex items-center justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
          alt="Almaco Autumn Winter Collection"
          fill
          priority
          className="object-cover object-center brightness-75"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-white">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-2 text-neutral-200">
            Musim Gugur / Musim Dingin
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-none uppercase">
            KOLEKSI <span className="font-light italic text-neutral-300">2026</span>
          </h1>
        </div>
      </section>

      <div className="w-full bg-neutral-100/90 border-y border-neutral-200 py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <section className="w-full px-4 sm:px-8 lg:px-12 py-10 flex-1">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-wider px-4 py-2 transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-neutral-400">Urutkan:</span>
            <div className="relative">
              <select className="text-xs font-medium bg-white border border-neutral-200 py-2 pl-3 pr-8 appearance-none focus:outline-none focus:border-neutral-900 cursor-pointer">
                <option>Paling Sesuai</option>
                <option>Harga: Rendah ke Tinggi</option>
                <option>Harga: Tinggi ke Rendah</option>
                <option>Produk Terbaru</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((item) => (
            <Link
              key={item.id}
              href={`/product-detail?id=${item.id}`}
              className="group bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-bold tracking-wider bg-white/95 px-2 py-0.5 border border-neutral-200 text-neutral-900">
                  {item.badge}
                </span>

                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-neutral-900/95 backdrop-blur-sm text-white text-[11px] font-semibold py-2.5 uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-950">
                    <ShoppingBag className="w-3.5 h-3.5" /> Lihat Detail
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{item.category}</span>
                <h4 className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:underline underline-offset-2">
                  {item.title}
                </h4>
                <p className="text-sm font-bold text-neutral-900 tracking-tight">
                  {item.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="w-full bg-neutral-900 text-white py-3.5 overflow-hidden border-y border-neutral-800">
        <div className="animate-marquee flex items-center">
          {deliveryTicker.concat(deliveryTicker).map((item, idx) => (
            <span
              key={idx}
              className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-400 mx-8 select-none"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>

      <section id="testimoni" className="bg-[#EFECE6] py-16 border-b border-neutral-200 overflow-hidden w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12 mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-semibold">BUKTI PENGIRIMAN ASLI</p>
          <h2 className="text-3xl font-serif uppercase tracking-tight">TESTIMONI</h2>
        </div>

        <div className="w-full overflow-hidden">
          <div className="animate-marquee-slow flex items-center">
            {testimonialImages.concat(testimonialImages).map((item, idx) => (
              <div
                key={idx}
                className="w-[240px] sm:w-[280px] aspect-[4/5] relative bg-neutral-200 mx-3 shrink-0 overflow-hidden border border-neutral-200 shadow-sm"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Admin"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        <svg
          className="w-7 h-7 fill-white"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        <span className="absolute right-16 bg-neutral-900 text-white text-[11px] font-semibold py-1.5 px-3 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[2px]">
          Chat Kami di WhatsApp
        </span>
      </a>

    </main>
  );
}