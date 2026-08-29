'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
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
  Check,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Footer from '../Footer';
import { useAuth } from '../penyimpanan/authcontext';
import { supabase } from '../penyimpanan/supabase';

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
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'biodata' | 'alamat' | 'keamanan'>('biodata');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Perubahan profil berhasil disimpan!');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State Biodata
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    alamat: '',
  });

  // State Alamat
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
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

  // State Keamanan / Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  // 1. Ambil data profil dari database Supabase
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push('/auth');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          setProfileData({
            name: profile.nama || session.user.email?.split('@')[0] || '',
            email: profile.email || session.user.email || '',
            phone: profile.no_hp || '',
            alamat: profile.alamat || '',
          });

          // Inisialisasi daftar alamat dari kolom alamat utama jika ada
          if (profile.alamat) {
            setAddresses([
              {
                id: 1,
                label: 'Alamat Utama',
                recipient: profile.nama || 'Pelanggan',
                phone: profile.no_hp || '-',
                city: 'Wilayah Terdaftar',
                address: profile.alamat,
                postalCode: '-',
                isDefault: true,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // 2. Simpan perubahan Biodata ke Supabase tabel profiles
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) throw new Error('Sesi telah berakhir.');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          nama: profileData.name.trim(),
          no_hp: profileData.phone.trim(),
          alamat: profileData.alamat.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (typeof refreshProfile === 'function') {
        await refreshProfile();
      }

      triggerToast('Biodata profil berhasil disimpan ke database!');
    } catch (err: any) {
      console.error('Gagal update profil:', err);
      alert('Gagal menyimpan profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Tambah Alamat Baru
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now();
    
    let updatedList = addresses;
    if (newAddress.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    const fullAddrString = `${newAddress.address}, ${newAddress.city} (${newAddress.postalCode})`;

    const addedList = [
      ...updatedList,
      {
        id: newId,
        ...newAddress,
        isDefault: newAddress.isDefault || addresses.length === 0,
      },
    ];

    setAddresses(addedList);

    // Update kolom alamat utama di tabel profiles jika diset default
    if (newAddress.isDefault || addresses.length === 0) {
      setProfileData((prev) => ({ ...prev, alamat: fullAddrString }));
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from('profiles')
            .update({ alamat: fullAddrString })
            .eq('id', session.user.id);
        }
      } catch (err) {
        console.error(err);
      }
    }

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

  // 4. Jadikan Alamat Utama
  const handleSetDefaultAddress = async (id: number) => {
    const selected = addresses.find((a) => a.id === id);
    if (!selected) return;

    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );

    const fullAddrString = `${selected.address}, ${selected.city} (${selected.postalCode})`;
    setProfileData((prev) => ({ ...prev, alamat: fullAddrString }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ alamat: fullAddrString })
          .eq('id', session.user.id);
      }
      triggerToast('Alamat utama berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Alamat berhasil dihapus!');
  };

  // 5. Ganti Password Riil di Supabase Auth
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Kata sandi akun Anda berhasil diperbarui!');
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Logout Akun
  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      await logout();
      router.push('/auth');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <p className="text-xs uppercase tracking-widest font-bold text-neutral-500">Memuat Profil Akun...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85 min-w-0">
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
              <div className="text-base sm:text-xl uppercase tracking-tight text-neutral-950">
                <span className="font-black">ALMACO</span><span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Kembali ke Beranda</span>
            <span className="xs:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {showSaveToast && (
          <div className="fixed top-20 sm:top-24 right-4 sm:right-6 z-50 bg-neutral-950 text-white px-4 sm:px-5 py-3 shadow-2xl flex items-center gap-2.5 border border-neutral-800 animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
          </div>
        )}

        {/* KARTU PROFIL HEADER */}
        <div className="bg-white border border-neutral-200 p-5 sm:p-8 mb-6 sm:mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-neutral-950 text-white border-2 border-neutral-300 flex items-center justify-center text-2xl sm:text-3xl font-black uppercase shadow-inner shrink-0">
              {profileData.name.charAt(0) || 'U'}
            </div>

            <div className="space-y-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wide text-neutral-950 truncate">
                {profileData.name || 'Pelanggan ALMACO'}
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">ID: {user?.id?.slice(0, 8) || 'MEMBER'}</p>
              
              <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> 
                  <span className="truncate max-w-[220px]">{profileData.email}</span>
                </span>
                {profileData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> 
                    <span>+{profileData.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-rose-600 hover:bg-rose-50 hover:text-rose-600 bg-white px-4 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* TAB KONTEN */}
        <div className="bg-white border border-neutral-200 shadow-xs">
          <div className="flex border-b border-neutral-200 bg-neutral-50/70 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('biodata')}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'biodata'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Biodata Diri</span>
            </button>

            <button
              onClick={() => setActiveSubTab('alamat')}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'alamat'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Alamat Pengiriman ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('keamanan')}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeSubTab === 'keamanan'
                  ? 'border-neutral-950 bg-white text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Keamanan & Password</span>
            </button>
          </div>

          {/* TAB 1: BIODATA */}
          {activeSubTab === 'biodata' && (
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-8 space-y-4 sm:space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                  Alamat Email (Akun Terdaftar)
                </label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full bg-neutral-100 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                  Alamat Lengkap Rumah
                </label>
                <textarea
                  rows={3}
                  value={profileData.alamat}
                  onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Biodata'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ALAMAT */}
          {activeSubTab === 'alamat' && (
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
                    Daftar Alamat Pengiriman
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                    Alamat utama digunakan otomatis saat Anda checkout pesanan busana.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-neutral-50 border border-neutral-200 p-8 text-center text-neutral-400 text-xs">
                  Belum ada alamat tambahan yang tersimpan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white border p-4 sm:p-5 space-y-3 relative flex flex-col justify-between transition-shadow hover:shadow-xs ${
                        addr.isDefault ? 'border-neutral-950 ring-1 ring-neutral-950 bg-neutral-50/40' : 'border-neutral-200'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-neutral-950 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                              Utama
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] sm:text-xs text-neutral-600 space-y-0.5 leading-relaxed">
                          <p className="font-bold text-neutral-900">
                            {addr.recipient} <span className="text-neutral-500 font-normal">({addr.phone})</span>
                          </p>
                          <p className="text-neutral-700">{addr.address}</p>
                          <p className="text-neutral-500">{addr.city} - {addr.postalCode}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] sm:text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-2 uppercase tracking-wider cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Alamat Aktif
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Hapus Alamat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEAMANAN & PASSWORD */}
          {activeSubTab === 'keamanan' && (
            <form onSubmit={handleChangePassword} className="p-5 sm:p-8 space-y-5 max-w-xl">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Perbarui Kata Sandi
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500">
                  Ganti kata sandi akun pelanggan Anda secara aman.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {passwordError}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-10 py-2 sm:py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Ulangi Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-6 py-3 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSaving ? 'Menyimpan...' : 'Ganti Kata Sandi'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH ALAMAT */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowAddressModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white border border-neutral-200 shadow-2xl p-5 sm:p-8 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-2.5">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
                Tambah Alamat Pengiriman
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500">Lengkapi detail alamat tujuan paket belanja Anda.</p>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5">
              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Label Alamat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rumah, Kantor, Kos"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    Nama Penerima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penerima"
                    value={newAddress.recipient}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                    No Telepon / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Kota / Kabupaten <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tulungagung, Jawa Timur"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Alamat Lengkap (Jalan, RT/RW, Patokan) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Jl. Mergayu No. 12, RT 01/RW 02"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 66274"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white"
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
                <label htmlFor="makeDefault" className="text-xs text-neutral-700 cursor-pointer select-none">
                  Jadikan sebagai alamat utama
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-2.5 transition text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 transition text-center shadow-xs cursor-pointer"
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