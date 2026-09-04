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
  ArrowRight,
  MapPin,
  Navigation,
  Clock,
  Building2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useKeranjang } from './penyimpanan/KeranjangContext';
import { useAuth } from './penyimpanan/authcontext';
import Footer from './Footer';
import { supabase } from './penyimpanan/supabase';

export default function Beranda() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [testimoniList, setTestimoniList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems = [], tambahKeKeranjang, totalCount } = (useKeranjang() as any) || {};
  const { isLoggedIn } = useAuth();

  const totalCartCount = totalCount !== undefined 
    ? totalCount 
    : cartItems.reduce((acc: number, item: any) => acc + (item.qty || 1), 0);

  // Ambil produk dan testimoni langsung dari Supabase
  const fetchDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Products
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && prodData) {
        const mapped = prodData.map((p: any) => ({
          id: p.id,
          nama: p.nama,
          kategori: p.kategori,
          harga: Number(p.harga || 0),
          stok: Number(p.stok || 0),
          berat: Number(p.berat || 350),
          deskripsi: p.deskripsi,
          gambarUtama: p.gambar_utama || (Array.isArray(p.gambar_list) && p.gambar_list[0]) || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
          gambarList: Array.isArray(p.gambar_list) ? p.gambar_list : [],
          warna: Array.isArray(p.warna) && p.warna.length > 0 ? p.warna : ['Default'],
          ukuran: Array.isArray(p.ukuran) && p.ukuran.length > 0 ? p.ukuran : ['All Size'],
        }));
        setProducts(mapped);

        const extractedCats = Array.from(new Set(prodData.map((p: any) => p.kategori))).filter(Boolean);
        if (extractedCats.length > 0) {
          setCategories(['Semua', ...(extractedCats as string[])]);
        }
      }

      // 2. Fetch Testimonials yang statusnya Tayang
      const { data: testData, error: testErr } = await supabase
        .from('testimonials')
        .select('*')
        .eq('tayang', true)
        .order('created_at', { ascending: false });

      if (!testErr && testData) {
        setTestimoniList(testData);
      }
    } catch (e) {
      console.error('Fetch Supabase Beranda Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromSupabase();
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

    if (item.stok <= 0) {
      alert('Maaf, stok produk ini sedang habis.');
      return;
    }

    if (typeof tambahKeKeranjang === 'function') {
      tambahKeKeranjang({
        id: item.id,
        title: item.nama,
        price: item.harga,
        image: item.gambarUtama,
        size: item.ukuran[0] || 'All Size',
        color: item.warna[0] || 'Default',
        weight: item.berat || 350,
      }, 1);
    }

    showToast(item.nama);
  };

  const noWhatsapp = '628883199088';
  const pesanWhatsapp = 'Halo Admin ALMACO FASHION, saya tertarik dan ingin bertanya mengenai katalog produk terbaru.';
  const waUrl = `https://api.whatsapp.com/send?phone=${noWhatsapp}&text=${encodeURIComponent(pesanWhatsapp)}`;
  const mapsUrl = 'https://maps.app.goo.gl/6rg5xWuRDZvKg76i6';

  const brandTicker = Array(12).fill('ALMACO FASHION');
  const deliveryTicker = Array(12).fill('TESTIMONI PENGIRIMAN');

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.kategori?.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      p.nama?.toLowerCase().includes(query) || 
      p.kategori?.toLowerCase().includes(query) || 
      p.deskripsi?.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    if (sortOption === 'price-low') return a.harga - b.harga;
    if (sortOption === 'price-high') return b.harga - a.harga;
    if (sortOption === 'newest') return b.id - a.id;
    return 0;
  });

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
      `}</style>

      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed top-4 sm:top-8 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none animate-in fade-in slide-in-from-top-6 duration-300">
          <div className="bg-neutral-950/95 backdrop-blur-md text-white px-3.5 sm:px-6 py-2.5 sm:py-3 border border-neutral-800 shadow-2xl flex items-center gap-2.5 sm:gap-4 max-w-sm sm:max-w-md w-full sm:w-auto rounded-full pointer-events-auto">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </div>
            <div className="text-[11px] sm:text-xs truncate flex-1 min-w-0">
              <span className="font-bold text-white block truncate">{toastMessage}</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">Masuk keranjang belanja</span>
            </div>
            <Link 
              href="/keranjang"
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white flex items-center gap-1 pl-2 border-l border-neutral-800 shrink-0"
            >
              <span>Lihat</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-3.5 sm:px-8 lg:px-12 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-85 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Almaco Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950 truncate">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-6 items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CARI BUSANA..."
              className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2 pr-9 text-xs tracking-wider uppercase text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:bg-white transition-all"
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
              <Link href="/#lokasi" className="hover:text-neutral-950 transition-colors py-1">
                Lokasi Butik
              </Link>
              <Link href="/#testimoni" className="hover:text-neutral-950 transition-colors py-1">
                Testimoni
              </Link>
            </nav>

            <Link
              href="/keranjang"
              className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-1 text-neutral-800 hover:text-neutral-950 transition-colors"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
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
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 p-1 text-neutral-800 hover:text-neutral-950 transition-colors text-xs font-bold uppercase tracking-[0.15em]"
              >
                <UserPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="hidden sm:inline">Masuk</span>
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
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3.5 space-y-2.5 shadow-lg">
            <div className="relative w-full mb-2 md:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CARI BUSANA..."
                className="w-full bg-neutral-50 border border-neutral-200 px-3 py-1.5 pr-8 text-xs tracking-wider uppercase"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2 pointer-events-none" />
              )}
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100"
            >
              Beranda
            </Link>
            <Link
              href="/#lokasi"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100"
            >
              Lokasi Butik
            </Link>
            <Link
              href="/#testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-100"
            >
              Testimoni
            </Link>
            <Link
              href={isLoggedIn ? "/profile" : "/auth"}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800"
            >
              {isLoggedIn ? 'Profile Saya' : 'Masuk / Daftar Akun'}
            </Link>
          </div>
        )}
      </header>

      {/* HERO BANNER */}
      <section className="relative h-[32vh] sm:h-[45vh] w-full flex items-center justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
          alt="Almaco Collection"
          fill
          priority
          className="object-cover object-center brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-white">
          <p className="text-[9px] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1 sm:mb-2 text-neutral-300">
            Koleksi Terbaru
          </p>
          <h1 className="text-2xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-none uppercase">
            ALMACO <span className="font-light italic text-neutral-300">FASHION</span>
          </h1>
        </div>
      </section>

      {/* RUNNING TEXT */}
      <div className="w-full bg-neutral-100/90 border-y border-neutral-200 py-2 sm:py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {brandTicker.concat(brandTicker).map((brand, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-neutral-400 mx-3 sm:mx-8 select-none whitespace-nowrap"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* DAFTAR KATALOG PRODUK */}
      <section className="w-full px-3.5 sm:px-8 lg:px-12 py-6 sm:py-10 flex-1">
        <div className="flex flex-row items-center justify-between border-b border-neutral-200 pb-3 sm:pb-4 mb-5 sm:mb-8 gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 shrink-0 hidden xs:inline">
              Kategori:
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:min-w-[190px] text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white border border-neutral-300 py-2 sm:py-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:border-neutral-950 cursor-pointer shadow-2xs text-neutral-900"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Semua' ? 'SEMUA KATEGORI' : cat.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial justify-end">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 shrink-0 hidden xs:inline">
              Urutkan:
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:min-w-[190px] text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white border border-neutral-300 py-2 sm:py-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:border-neutral-950 cursor-pointer shadow-2xs text-neutral-900"
              >
                <option value="default">Paling Sesuai</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="newest">Produk Terbaru</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-neutral-200 p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-2 shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-800" />
            <span className="text-xs uppercase tracking-wider font-semibold">Memuat Koleksi Busana...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-8 sm:p-12 text-center text-neutral-400 space-y-2.5 shadow-xs my-4">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-300" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                {searchQuery || selectedCategory !== 'Semua' 
                  ? 'Produk Tidak Ditemukan' 
                  : 'Belum Ada Produk Tersedia'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">
                {searchQuery || selectedCategory !== 'Semua'
                  ? 'Tidak ada busana yang sesuai dengan pencarian atau filter ini.'
                  : 'Katalog pakaian akan otomatis tampil setelah diunggah melalui Panel Admin.'}
              </p>
            </div>
            {(searchQuery || selectedCategory !== 'Semua') && (
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 bg-neutral-950 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 mt-1 hover:bg-black transition cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <Link href={`/product-detail?id=${item.id}`} className="block relative">
                  <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                    <Image
                      src={item.gambarUtama}
                      alt={item.nama}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider bg-white/95 px-2 py-0.5 border border-neutral-200 text-neutral-900">
                      {item.stok > 0 ? `Stok: ${item.stok}` : 'Habis'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-4 space-y-1">
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">
                      {item.kategori}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-medium text-neutral-900 line-clamp-1 group-hover:underline underline-offset-2">
                      {item.nama}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-neutral-950 tracking-tight">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </p>
                  </div>
                </Link>

                <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, item)}
                    disabled={item.stok <= 0}
                    className={`w-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 transition-colors ${
                      item.stok > 0
                        ? 'bg-neutral-950 hover:bg-neutral-800 text-white cursor-pointer active:scale-[0.98]'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{item.stok > 0 ? '+ Keranjang' : 'Habis'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

            {/* TESTIMONI */}
      {testimoniList.length > 0 && (
        <>
          <div className="w-full bg-neutral-900 text-white py-2.5 overflow-hidden border-y border-neutral-800">
            <div className="animate-marquee flex items-center">
              {deliveryTicker.concat(deliveryTicker).map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-400 mx-4 select-none whitespace-nowrap"
                >
                  ✦ {item}
                </span>
              ))}
            </div>
          </div>

          <section id="testimoni" className="bg-[#EFECE6] py-8 sm:py-14 border-b border-neutral-200 overflow-hidden w-full">
            <div className="w-full px-4 sm:px-8 mb-4 sm:mb-8 text-center">
              <p className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 mb-1 font-bold">
                BUKTI PENGIRIMAN ASLI
              </p>
              <h2 className="text-xl sm:text-3xl font-serif uppercase tracking-tight">
                TESTIMONI PELANGGAN
              </h2>
            </div>

            <div className="w-full overflow-hidden">
              <div className="animate-marquee-slow flex items-center">
                {testimoniList.concat(testimoniList).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-[140px] sm:w-[240px] aspect-[3/4] relative bg-neutral-200 mx-2 shrink-0 overflow-hidden border border-neutral-200 shadow-xs"
                  >
                    <Image
                      src={item.foto_url}
                      alt={`Testimoni ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 140px, 240px"
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* LOKASI BUTIK */}
      <section id="lokasi" className="w-full bg-[#F9F8F6] border-t border-neutral-200 py-8 sm:py-14">
        <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-6 sm:mb-8">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
              KUNJUNGI KAMI
            </p>
            <h2 className="text-lg sm:text-2xl font-serif uppercase tracking-tight text-neutral-950">
              LOKASI BUTIK & WORKSHOP
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              Produksi langsung dari pusat konveksi kami di Tulungagung. Melayani pesanan ke seluruh Indonesia.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-neutral-200 shadow-xs overflow-hidden">
            <div className="flex flex-row items-stretch min-h-[220px] sm:min-h-[300px]">
              <div className="w-[48%] sm:w-[45%] p-3.5 sm:p-6 flex flex-col justify-between border-r border-neutral-200 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-950 truncate">
                        ALMACO FASHION
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-neutral-400">
                        Konveksi & Butik Busana
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-neutral-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[9px] sm:text-[10px] text-neutral-900 uppercase font-bold">Alamat:</strong>
                        <p className="text-neutral-500 leading-tight text-[9px] sm:text-[11px]">
                          Dusun Jai, RT 02 / RW 02, Mergayu, Bandung, Tulungagung
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[9px] sm:text-[10px] text-neutral-900 uppercase font-bold">Jam Buka:</strong>
                        <p className="text-neutral-500 leading-tight text-[9px] sm:text-[11px]">
                          Senin – Sabtu: 08.00–21.00 WIB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-black text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider py-2 sm:py-2.5 px-2 transition shadow-xs"
                  >
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    <span>BUKA DI GOOGLE MAPS</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              </div>

              <div className="w-[52%] sm:w-[55%] bg-neutral-100 relative">
                <iframe
                  title="Peta Lokasi ALMACO FASHION"
                  src="https://maps.google.com/maps?q=RQM9%2BHRH%20Mergayu%2C%20Kabupaten%20Tulungagung%2C%20Jawa%20Timur&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 absolute inset-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <Footer />

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Admin"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
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