'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronDown, 
  ShoppingBag, 
  Search, 
  User, 
  UserPlus, 
  Menu, 
  X,
  Plus,
  Check,
  ArrowRight
} from 'lucide-react';
import { useKeranjang } from './penyimpanan/KeranjangContext';
import Footer from './Footer';

export default function Beranda() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);

  const keranjangCtx = useKeranjang();
  const cartItems = (keranjangCtx as any)?.cartItems || [];
  const totalCartCount = cartItems.reduce((acc: number, item: any) => acc + (item.qty || 1), 0);

  useEffect(() => {
    const savedUser = localStorage.getItem('almaco_user') || localStorage.getItem('user');
    if (savedUser) {
      setIsLoggedIn(true);
    }

    try {
      const savedProducts = localStorage.getItem('almaco_produk_list');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
      const savedCategories = localStorage.getItem('almaco_kategori_list');
      if (savedCategories) {
        const parsedCat = JSON.parse(savedCategories);
        setCategories(['Semua', ...parsedCat]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const numericPrice = typeof item.harga === 'number' 
      ? item.harga 
      : (typeof item.price === 'number' 
          ? item.price 
          : parseInt(String(item.price || item.harga).replace(/[^0-9]/g, ''), 10) || 100000);

    const payload = {
      id: String(item.id),
      title: item.nama || item.title,
      price: numericPrice,
      image: item.gambarUtama || item.gambar || (item.gambarList && item.gambarList[0]) || item.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
      size: (item.ukuran && item.ukuran[0]) || 'All Size',
      color: (item.warna && item.warna[0]) || 'Default',
      qty: 1,
    };

    const addFn = (keranjangCtx as any)?.tambahItem || 
                  (keranjangCtx as any)?.addToCart || 
                  (keranjangCtx as any)?.tambahKeKeranjang || 
                  (keranjangCtx as any)?.addItem;

    if (typeof addFn === 'function') {
      addFn(payload);
    }

    showToast(item.nama || item.title);
  };

  const noWhatsapp = '628883199088';
  const pesanWhatsapp = 'Halo Admin ALMACO FASHION, saya tertarik dan ingin bertanya mengenai katalog produk terbaru.';
  const waUrl = `https://api.whatsapp.com/send?phone=${noWhatsapp}&text=${encodeURIComponent(pesanWhatsapp)}`;

  const brandTicker = Array(12).fill('ALMACO FASHION');
  const deliveryTicker = Array(12).fill('TESTIMONI PENGIRIMAN');

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.kategori?.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      p.nama?.toLowerCase().includes(query) || 
      p.kategori?.toLowerCase().includes(query) ||
      p.deskripsi?.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    if (sortOption === 'price-low') return (a.harga || 0) - (b.harga || 0);
    if (sortOption === 'price-high') return (b.harga || 0) - (a.harga || 0);
    if (sortOption === 'newest') return (b.id || 0) - (a.id || 0);
    return 0;
  });

  // Testimoni Live dari Admin
  const [testimoniList, setTestimoniList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedTestimoni = localStorage.getItem('almaco_testimoni_list');
      if (savedTestimoni) {
        const parsed = JSON.parse(savedTestimoni);
        setTestimoniList(parsed.filter((t: any) => t.tayang));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <main id="beranda" className="min-h-screen bg-[#F9F8F6] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white scroll-smooth relative flex flex-col justify-between overflow-x-hidden">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {toastMessage && (
        <div className="fixed top-6 sm:top-8 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-6 duration-300">
          <div className="bg-neutral-950/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 border border-neutral-800 shadow-2xl flex items-center gap-3 sm:gap-4 max-w-md w-full sm:w-auto rounded-full pointer-events-auto">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="text-xs truncate flex-1 min-w-0">
              <span className="font-bold text-white block truncate">{toastMessage}</span>
              <span className="text-[10px] text-neutral-400">Ditambahkan ke keranjang belanja</span>
            </div>
            <Link 
              href="/keranjang"
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white flex items-center gap-1 pl-2 border-l border-neutral-800 shrink-0"
            >
              <span>Lihat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
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

          {/* Search Bar Desktop */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-6 items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CARI BUSANA..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-none px-4 py-2 pr-9 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white transition-all duration-200"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-neutral-400 hover:text-neutral-900">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none" />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 shrink-0">
            <nav className="hidden lg:flex items-center space-x-6 text-xs tracking-[0.15em] uppercase font-bold text-neutral-700">
              <Link href="/" className="hover:text-neutral-950 transition-colors py-1">
                Beranda
              </Link>
              <Link href="/#testimoni" className="hover:text-neutral-950 transition-colors py-1">
                Testimoni
              </Link>
            </nav>

            <Link
              href="/keranjang"
              className="flex items-center gap-1.5 p-1.5 sm:p-1 text-neutral-800 hover:text-neutral-950 transition-colors"
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
                <span className="hidden sm:inline">Daftar | Login</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-900 border border-neutral-300 hover:border-neutral-900 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-5 py-4 space-y-3 shadow-lg">
            <div className="relative w-full mb-3 md:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CARI BUSANA..."
                className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 pr-9 text-xs tracking-wider uppercase"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-900">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
              )}
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100"
            >
              Beranda
            </Link>
            <Link
              href="/#testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100"
            >
              Testimoni
            </Link>
            <Link
              href={isLoggedIn ? "/profile" : "/auth"}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-800"
            >
              {isLoggedIn ? 'Profile Saya' : 'Masuk / Daftar Akun'}
            </Link>
          </div>
        )}
      </header>

      <section className="relative h-[38vh] sm:h-[45vh] w-full flex items-center justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
          alt="Almaco Autumn Winter Collection"
          fill
          priority
          className="object-cover object-center brightness-75"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
        
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-white">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1.5 sm:mb-2 text-neutral-300">
            Musim Gugur / Musim Dingin
          </p>
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-none uppercase">
            KOLEKSI <span className="font-light italic text-neutral-300">2026</span>
          </h1>
        </div>
      </section>

      <div className="w-full bg-neutral-100/90 border-y border-neutral-200 py-2.5 sm:py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-neutral-400 mx-4 sm:mx-8 select-none whitespace-nowrap"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <section className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-10 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-4 mb-6 sm:mb-8 gap-4">
          
          {/* Dropdown Filter Kategori Sleek */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Kategori Busana:</span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider bg-white border border-neutral-300 py-2.5 pl-4 pr-10 appearance-none focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 cursor-pointer shadow-2xs transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Semua' ? 'SEMUA KATEGORI' : cat.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Urutkan:</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider bg-white border border-neutral-300 py-2.5 pl-4 pr-10 appearance-none focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 cursor-pointer shadow-2xs transition-all"
              >
                <option value="default">Paling Sesuai</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="newest">Produk Terbaru</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid Etalase Produk Real Admin */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center text-neutral-400 space-y-3 shadow-xs my-6">
            <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                {searchQuery || selectedCategory !== 'Semua' 
                  ? 'Produk Tidak Ditemukan' 
                  : 'Belum Ada Produk Tersedia'}
              </p>
              <p className="text-[11px] text-neutral-400">
                {searchQuery || selectedCategory !== 'Semua'
                  ? `Tidak ada busana yang sesuai dengan pencarian atau kategori ini.`
                  : 'Produk busana akan otomatis muncul di sini begitu diunggah dari Panel Admin.'}
              </p>
            </div>
            {(searchQuery || selectedCategory !== 'Semua') && (
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 mt-2 hover:bg-black transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((item) => {
              const displayImg = item.gambarUtama || item.gambar || (item.gambarList && item.gambarList[0]) || item.image || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop';
              const displayPrice = typeof item.harga === 'number' 
                ? `Rp ${item.harga.toLocaleString('id-ID')}` 
                : item.price || `Rp ${item.harga}`;
              const displayTitle = item.nama || item.title;
              const displayCat = item.kategori || item.category || 'BUSANA';

              return (
                <div
                  key={item.id}
                  className="group bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
                >
                  <Link href={`/product-detail?id=${item.id}`} className="block relative">
                    <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                      <Image
                        src={displayImg}
                        alt={displayTitle}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider bg-white/95 px-1.5 sm:px-2 py-0.5 border border-neutral-200 text-neutral-900">
                        {item.stok > 0 ? `Stok: ${item.stok}` : 'Habis'}
                      </span>

                      <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full bg-neutral-900/95 backdrop-blur-xs text-white text-[11px] font-semibold py-2.5 uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-950">
                          <ShoppingBag className="w-3.5 h-3.5" /> Lihat Detail
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">
                        {displayCat}
                      </span>
                      <h4 className="text-[11px] sm:text-xs font-medium text-neutral-900 line-clamp-1 group-hover:underline underline-offset-2">
                        {displayTitle}
                      </h4>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                        {displayPrice}
                      </p>
                    </div>
                  </Link>

                  <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, item)}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-2 sm:py-2.5 flex items-center justify-center gap-1.5 border border-neutral-900 transition-colors active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Keranjang</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Testimoni Pengiriman (Hanya Muncul Jika Ada Testimoni Real Dari Admin) */}
      {testimoniList.length > 0 && (
        <>
          <div className="w-full bg-neutral-900 text-white py-3 sm:py-3.5 overflow-hidden border-y border-neutral-800">
            <div className="animate-marquee flex items-center">
              {deliveryTicker.concat(deliveryTicker).map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] sm:text-xs font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-neutral-400 mx-4 sm:mx-8 select-none whitespace-nowrap"
                >
                  ✦ {item}
                </span>
              ))}
            </div>
          </div>

          <section id="testimoni" className="bg-[#EFECE6] py-12 sm:py-16 border-b border-neutral-200 overflow-hidden w-full">
            <div className="w-full px-4 sm:px-8 lg:px-12 mb-6 sm:mb-8 text-center">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 mb-1 font-bold">
                BUKTI PENGIRIMAN ASLI
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight">
                TESTIMONI
              </h2>
            </div>

            <div className="w-full overflow-hidden">
              <div className="animate-marquee-slow flex items-center">
                {testimoniList.concat(testimoniList).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-[180px] sm:w-[260px] aspect-[4/5] relative bg-neutral-200 mx-2 sm:mx-3 shrink-0 overflow-hidden border border-neutral-200 shadow-xs"
                  >
                    <Image
                      src={item.foto}
                      alt={`Testimoni ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />


      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Admin"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-white"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        <span className="hidden sm:block absolute right-16 bg-neutral-900 text-white text-[11px] font-semibold py-1.5 px-3 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[2px]">
          Chat Kami di WhatsApp
        </span>
      </a>
    </main>
  );
}