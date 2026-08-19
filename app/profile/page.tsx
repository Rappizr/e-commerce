'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  CheckCircle2,
  LogOut,
  Plus,
  Trash2,
  X,
  Check
} from 'lucide-react';
import Footer from '../Footer';

interface AddressItem {
  id: number;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'biodata' | 'alamat' | 'keamanan'>('biodata');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Perubahan profil berhasil disimpan!');

  // Form State Pengguna
  const [profileData, setProfileData] = useState({
    name: 'Rappi Ramadhan',
    username: '@rappi_almaco',
    email: 'rappi.fashion@almaco.id',
    phone: '08883199088',
    gender: 'Laki-laki',
    birthDate: '1998-10-14',
    bio: 'Pencinta busana bertema arsitektural minimalis & modest wear.',
  });

  // State Daftar Alamat Pengiriman
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 1,
      label: 'Rumah (Utama)',
      recipient: 'Rappi Ramadhan',
      phone: '08883199088',
      city: 'Papua, Kota Jayapura, Abepura',
      address: 'Jl. Raya Abepura No. 45, RT 03/RW 02',
      postalCode: '99225',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Kantor / Studio',
      recipient: 'Rappi (Studio Almaco)',
      phone: '08883199088',
      city: 'Jawa Barat, Kota Bandung, Cibiru',
      address: 'Kompleks Ruko Cibiru Regency Blok B-12',
      postalCode: '40614',
      isDefault: false,
    },
  ]);

  // State Modal Tambah Alamat Baru
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    recipient: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
    isDefault: false,
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      triggerToast('Foto profil berhasil diperbarui!');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Biodata profil berhasil disimpan!');
  };

  // Tambah Alamat Baru
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now();
    
    let updatedList = addresses;
    if (newAddress.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    setAddresses([
      ...updatedList,
      {
        id: newId,
        ...newAddress,
        isDefault: newAddress.isDefault || addresses.length === 0,
      },
    ]);

    setNewAddress({
      label: '',
      recipient: '',
      phone: '',
      city: '',
      address: '',
      postalCode: '',
      isDefault: false,
    });
    setShowAddressModal(false);
    triggerToast('Alamat baru berhasil ditambahkan!');
  };

  // Set Sebagai Alamat Utama
  const handleSetDefaultAddress = (id: number) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
    triggerToast('Alamat utama berhasil diubah!');
  };

  // Hapus Alamat
  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Alamat berhasil dihapus!');
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

      {/* Konten Utama */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Toast Notifikasi */}
        {showSaveToast && (
          <div className="fixed top-24 right-6 z-50 bg-neutral-950 text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-neutral-800 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
          </div>
        )}

        {/* HEADER PROFIL PENGGUNA */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-300 relative shadow-inner">
                {avatar ? (
                  <Image src={avatar} alt={profileData.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white text-3xl font-black uppercase">
                    {profileData.name.charAt(0)}
                  </div>
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-neutral-900 hover:bg-black text-white p-2 rounded-full cursor-pointer shadow-md transition transform hover:scale-110 active:scale-95"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-neutral-950">
                {profileData.name}
              </h1>
              <p className="text-xs text-neutral-500 font-medium">{profileData.username}</p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-neutral-600">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-neutral-400" /> {profileData.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-neutral-400" /> {profileData.phone}</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            className="inline-flex items-center gap-2 border border-neutral-300 hover:border-neutral-900 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-neutral-500" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* CONTAINER TAB PROFIL */}
        <div className="bg-white border border-neutral-200 shadow-xs">
          
          {/* Header Navigasi Tab */}
          <div className="flex border-b border-neutral-200 bg-neutral-50/70 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubTab('biodata')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'biodata'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Biodata Diri</span>
            </button>

            {/* TAB ALAMAT PENGIRIMAN */}
            <button
              onClick={() => setActiveSubTab('alamat')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'alamat'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Alamat Pengiriman ({addresses.length})</span>
            </button>

            {/* TAB KEAMANAN & PASSWORD */}
            <button
              onClick={() => setActiveSubTab('keamanan')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'keamanan'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Keamanan & Password</span>
            </button>
          </div>

          {/* TAB 1: BIODATA DIRI */}
          {activeSubTab === 'biodata' && (
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Jenis Kelamin
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={profileData.birthDate}
                    onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                  Bio / Catatan Gaya
                </label>
                <textarea
                  rows={2}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Ceritakan preferensi gaya atau ukuran favorit Anda..."
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 shadow-xs transition-all duration-200 flex items-center gap-2 active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Biodata</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ALAMAT PENGIRIMAN */}
          {activeSubTab === 'alamat' && (
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                    Daftar Alamat Pengiriman
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Alamat ini akan otomatis digunakan saat Anda checkout pemesanan busana.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 transition-all shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {/* Grid List Alamat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white border p-5 space-y-3.5 relative flex flex-col justify-between transition-shadow hover:shadow-xs ${
                      addr.isDefault ? 'border-neutral-950 ring-1 ring-neutral-950 bg-neutral-50/30' : 'border-neutral-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                              Utama
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-neutral-600 space-y-1 leading-relaxed">
                        <p className="font-bold text-neutral-900">
                          {addr.recipient} <span className="text-neutral-500 font-normal">({addr.phone})</span>
                        </p>
                        <p className="text-neutral-700">{addr.address}</p>
                        <p className="text-neutral-500">{addr.city} - {addr.postalCode}</p>
                      </div>
                    </div>

                    {/* Tombol Aksi per Alamat */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-2 uppercase tracking-wider"
                        >
                          Jadikan Utama
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Alamat Aktif
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus Alamat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: KEAMANAN & PASSWORD */}
          {activeSubTab === 'keamanan' && (
            <div className="p-6 sm:p-8 space-y-6 max-w-xl">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Perbarui Kata Sandi</h3>
                <p className="text-xs text-neutral-500">Pastikan gunakan kombinasi huruf besar, angka, dan simbol.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">Kata Sandi Saat Ini</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">Kata Sandi Baru</label>
                  <input type="password" placeholder="Minimal 8 karakter" className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">Konfirmasi Kata Sandi Baru</label>
                  <input type="password" placeholder="Ulangi kata sandi baru" className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white" />
                </div>
              </div>

              <button type="button" className="bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 transition">
                Ganti Kata Sandi
              </button>
            </div>
          )}

        </div>

      </main>

      {/* MODAL POP-UP TAMBAH ALAMAT BARU */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowAddressModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-950">
                Tambah Alamat Pengiriman
              </h3>
              <p className="text-xs text-neutral-500">Lengkapi detail alamat tujuan pengiriman pesanan Anda.</p>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Label Alamat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rumah, Kantor, Kos, Apartemen"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Nama Penerima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={newAddress.recipient}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    No Telepon / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Kota / Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Papua, Kota Jayapura, Abepura"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Jl. Diponegoro No. 12, Kel. Asano"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 99225"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="makeDefault" className="text-xs text-neutral-700 cursor-pointer">
                  Jadikan sebagai alamat utama
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 transition-colors text-center shadow-xs"
                >
                  Simpan Alamat
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}