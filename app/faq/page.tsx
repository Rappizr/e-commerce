'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  HelpCircle, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Sparkles,
  MessageCircle
} from 'lucide-react';
import Footer from '../Footer';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const noWhatsapp = '628883199088';
  const pesanWhatsapp = 'Halo Admin ALMACO FASHION, saya ingin bertanya hal yang tidak ada di daftar FAQ.';
  const waUrl = `https://api.whatsapp.com/send?phone=${noWhatsapp}&text=${encodeURIComponent(pesanWhatsapp)}`;

  const categories = [
    { name: 'Semua', icon: HelpCircle },
    { name: 'Pemesanan', icon: ShoppingBag },
    { name: 'Pembayaran', icon: CreditCard },
    { name: 'Pengiriman', icon: Truck },
    { name: 'Garansi & Retur', icon: RotateCcw },
    { name: 'Produk & Bahan', icon: Sparkles },
  ];

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'Pemesanan',
      question: 'Bagaimana cara melakukan pemesanan di ALMACO FASHION?',
      answer: 'Pilih produk yang Anda inginkan di etalase beranda, tentukan warna serta ukuran, lalu klik "Tambah ke Keranjang". Setelah itu, buka halaman Keranjang Belanja dan klik "Lanjut ke Pembayaran" untuk mengisi alamat pengiriman.',
    },
    {
      id: 2,
      category: 'Pemesanan',
      question: 'Apakah bisa memesan langsung melalui WhatsApp Admin?',
      answer: 'Ya, tentu bisa! Anda dapat menekan tombol WhatsApp yang melayang di pojok kanan bawah atau memilih kontak admin di bagian footer untuk dibantu proses pemesanan secara manual oleh tim kami.',
    },
    {
      id: 3,
      category: 'Pembayaran',
      question: 'Metode pembayaran apa saja yang didukung?',
      answer: 'Saat ini kami mendukung Transfer Bank Resmi serta BCA Virtual Account yang terverifikasi otomatis selama 24 jam penuh tanpa perlu menunggu konfirmasi manual berlama-lama.',
    },
    {
      id: 4,
      category: 'Pembayaran',
      question: 'Berapa lama batas waktu pembayaran setelah checkout?',
      answer: 'Batas waktu transfer pembayaran adalah 1x24 jam sejak pesanan dibuat. Jika melewati batas tersebut tanpa konfirmasi, sistem akan otomatis membatalkan pesanan.',
    },
    {
      id: 5,
      category: 'Pengiriman',
      question: 'Dari mana pesanan dikirim dan menggunakan ekspedisi apa?',
      answer: 'Seluruh pesanan busana kami dikirim langsung dari workshop resmi kami di Dusun Jai, Desa Mergayu, Kec. Bandung, Kab. Tulungagung. Kami bekerja sama dengan ekspedisi terpercaya seperti JNE, J&T Express, dan SiCepat.',
    },
    {
      id: 6,
      category: 'Pengiriman',
      question: 'Berapa lama estimasi pengiriman sampai ke rumah saya?',
      answer: 'Untuk wilayah Pulau Jawa estimasi tiba sekitar 1–3 hari kerja. Sedangkan untuk luar Pulau Jawa berkisar antara 2–5 hari kerja tergantung pada kota/kabupaten tujuan dan jenis layanan kurir yang dipilih.',
    },
    {
      id: 7,
      category: 'Garansi & Retur',
      question: 'Apakah produk bisa ditukar jika ukuran tidak pas atau barang cacat?',
      answer: 'Bisa! Kami memberikan Garansi Retur 100% jika produk yang diterima terdapat cacat produksi atau salah kirim. Syaratnya: sertakan video unboxing utuh tanpa jeda dan ajukan retur maksimal 2x24 jam setelah paket diterima.',
    },
    {
      id: 8,
      category: 'Produk & Bahan',
      question: 'Apa keunggulan bahan Rayon Premium dan Silk yang digunakan ALMACO?',
      answer: 'Kami hanya menggunakan serat Rayon Premium dengan kerapatan benang tinggi yang terbukti ekstra adem, jatuh anggun di badan, tidak menerawang, dan menyerap keringat dengan sempurna untuk pemakaian harian di iklim tropis.',
    },
    {
      id: 9,
      category: 'Produk & Bahan',
      question: 'Bagaimana petunjuk mencuci daster dan gamis agar awet?',
      answer: 'Disarankan mencuci dengan tangan menggunakan deterjen lembut, tidak memakai pemutih, serta hindari memeras kain terlalu keras. Jemur di tempat yang teduh dan setrika dengan suhu sedang.',
    },
  ];

  const toggleAccordion = (id: number) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const filteredFaqs = faqData.filter((item) => {
    const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

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

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-neutral-400 block">
            PUSAT BANTUAN & INFORMASI
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif uppercase tracking-tight text-neutral-950 leading-snug">
            PERTANYAAN UMUM (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed pt-0.5 sm:pt-1">
            Temukan jawaban cepat seputar tata cara pembelian, pembayaran, pengiriman paket, hingga panduan perawatan produk kami.
          </p>

          <div className="max-w-xl mx-auto pt-3 sm:pt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pertanyaan... (contoh: pengiriman, retur, bahan)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-300 pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 shadow-xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 mb-6 sm:mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-all border whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3 sm:space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200/90 transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4 sm:p-6 flex items-center justify-between text-left gap-3 sm:gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                      {item.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-900 leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-300 ${
                      openAccordion === item.id ? 'rotate-180 text-neutral-950' : ''
                    }`}
                  />
                </button>

                {openAccordion === item.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 border-t border-neutral-100 animate-in fade-in duration-200">
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border border-neutral-200 p-8 sm:p-10 text-center space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Pertanyaan tidak ditemukan
              </p>
              <p className="text-[11px] sm:text-xs text-neutral-500">
                Coba gunakan kata kunci lain atau langsung tanyakan ke Admin WhatsApp kami.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-12 bg-[#EFECE6] border border-neutral-300 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Masih Memiliki Pertanyaan Lain?
            </h4>
            <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
              Tim admin layanan pelanggan kami siap membantu Anda setiap hari Senin - Sabtu.
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest px-5 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Admin WhatsApp</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}