"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Loader2,
  ShoppingBag,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import Footer from "../Footer";
import { supabase } from "../penyimpanan/supabase";

import ProfileToast from "./components/ProfileToast";
import TabBiodata from "./components/TabBiodata";
import TabPesanan, { OrderItem } from "./components/TabPesanan";
import TabAlamat, { AddressItem } from "./components/TabAlamat";
import TabKeamanan from "./components/TabKeamanan";
import ModalAddressForm, {
  RajaOngkirCity,
} from "./components/ModalAddressForm";
import ModalDeleteAddress from "./components/ModalDeleteAddress";
import ModalLogout from "./components/ModalLogout";

function formatCityDisplay(
  cityName: string,
  postalCode?: string,
  villageName?: string,
): string {
  if (!cityName) return "";

  const parts = cityName
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const uniqueParts: string[] = [];
  parts.forEach((part) => {
    if (
      !uniqueParts.some((item) => item.toLowerCase() === part.toLowerCase())
    ) {
      uniqueParts.push(part);
    }
  });

  let result = uniqueParts.join(", ");

  if (
    villageName &&
    villageName.trim() !== "" &&
    !result.toLowerCase().includes(villageName.toLowerCase())
  ) {
    const cleanVillage = villageName
      .replace(/^kecamatan\s+/gi, "")
      .trim()
      .toUpperCase();
    result = `Kecamatan ${cleanVillage}, ${result}`;
  }

  if (postalCode && postalCode !== "-" && !result.includes(postalCode)) {
    result = `${result}, ${postalCode}`;
  }

  return result;
}

export default function ProfilePage() {
  const router = useRouter();

  const [activeSubTab, setActiveSubTab] = useState<
    "biodata" | "pesanan" | "alamat" | "keamanan"
  >("pesanan");

  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    "Perubahan berhasil disimpan!",
  );
  const [toastType, setToastType] = useState<"success" | "danger" | "info">(
    "success",
  );

  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [userId, setUserId] = useState<string>("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    alamat: "",
  });

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    phone: "",
    city: "",
    city_id: "",
    village: "",
    address: "",
    postalCode: "",
    isDefault: false,
  });

  const [citySearchInput, setCitySearchInput] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [cityResults, setCityResults] = useState<RajaOngkirCity[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const searchCityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (
    msg: string,
    type: "success" | "danger" | "info" = "success",
  ) => {
    setToastMessage(msg);
    setToastType(type);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3500);
  };

  const fetchOrders = async (uid: string) => {
    setIsLoadingOrders(true);
    try {
      // PERBAIKAN: Hapus 'total' dari select query, gunakan 'total_harga'
      const { data, error } = await supabase
        .from("orders")
        .select("id, invoice_no, status, total_harga, kurir, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Gagal load pesanan:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadUserData = async (currentUser: any) => {
    try {
      let query = supabase.from("profiles").select("*");

      if (currentUser?.id) {
        query = query.eq("id", currentUser.id);
      } else {
        const storedEmail = localStorage.getItem("almaco_user_email");
        if (storedEmail) {
          query = query.eq("email", storedEmail);
        }
      }

      const { data: profile } = await query.maybeSingle();
      const resolvedId = profile?.id || currentUser?.id || "";
      if (resolvedId) {
        setUserId(resolvedId);
      }

      const resolvedName =
        profile?.nama ||
        currentUser?.user_metadata?.nama ||
        profile?.email?.split("@")[0] ||
        "Pelanggan ALMACO";
      const resolvedEmail = profile?.email || currentUser?.email || "";
      const resolvedPhone =
        profile?.no_hp || currentUser?.user_metadata?.no_hp || "";
      const resolvedAddress = profile?.alamat || "";

      setProfileData({
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        alamat: resolvedAddress,
      });

      let savedAddrList: AddressItem[] = [];
      if (
        Array.isArray(profile?.daftar_alamat) &&
        profile.daftar_alamat.length > 0
      ) {
        savedAddrList = profile.daftar_alamat;
      } else {
        const localStored = localStorage.getItem("almaco_saved_addresses");
        if (localStored) {
          try {
            savedAddrList = JSON.parse(localStored);
          } catch (e) {
            savedAddrList = [];
          }
        }
      }

      if (savedAddrList.length === 0 && resolvedAddress) {
        savedAddrList = [
          {
            id: 1,
            label: "Alamat Utama",
            recipient: resolvedName,
            phone: resolvedPhone || "-",
            city: "Wilayah Terdaftar",
            address: resolvedAddress,
            postalCode: "-",
            isDefault: true,
          },
        ];
      }

      setAddresses(savedAddrList);
      localStorage.setItem(
        "almaco_saved_addresses",
        JSON.stringify(savedAddrList),
      );

      if (resolvedId) {
        await fetchOrders(resolvedId);
      }
    } catch (err) {
      console.error("Gagal load profil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          await loadUserData(session.user);
          return;
        }

        const storedEmail = localStorage.getItem("almaco_user_email");
        if (storedEmail && isMounted) {
          await loadUserData({ email: storedEmail });
          return;
        }
        if (isMounted) {
          router.replace("/auth?redirect=/profile");
        }
        if (isMounted) setIsLoading(false);
      } catch (e) {
        if (isMounted) {
          router.replace("/auth?redirect=/profile");
        }
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await loadUserData(session.user);
      } else if (event === "SIGNED_OUT") {
        setUserId("");
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCitySearchInput(val);
    setSelectedCityId("");

    if (searchCityTimeoutRef.current)
      clearTimeout(searchCityTimeoutRef.current);
    if (val.trim().length < 3) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCity(true);
    setShowCityDropdown(true);

    searchCityTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rajaongkir?q=${encodeURIComponent(val)}`);
        const text = await res.text();
        let data: any = { results: [] };
        try {
          data = JSON.parse(text);
        } catch {
          data = { results: [] };
        }
        setCityResults(data.results || []);
      } catch (err) {
        console.error("Gagal cari kota:", err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 350);
  };

  const handleSelectCity = (city: RajaOngkirCity) => {
    const rawName = `${city.type ? city.type + " " : ""}${city.city_name}${city.province ? ", " + city.province : ""}`;
    const formatted = formatCityDisplay(
      rawName,
      city.postal_code,
      addressForm.village,
    );

    setCitySearchInput(formatted);
    setSelectedCityId(city.city_id);
    setAddressForm((prev) => ({
      ...prev,
      city: formatted,
      city_id: city.city_id,
      postalCode: city.postal_code || prev.postalCode,
    }));
    setShowCityDropdown(false);
  };

  const unpaidOrders = orders.filter((o) => o.status === "Menunggu Pembayaran");
  const unpaidCount = unpaidOrders.length;
  const firstUnpaid = unpaidOrders[0];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSaving(true);

    try {
      const cleanName = profileData.name.trim();

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: profileData.email,
        nama: cleanName,
        no_hp: profileData.phone.trim(),
        alamat: profileData.alamat.trim(),
        daftar_alamat: addresses,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      triggerToast("Biodata profil berhasil disimpan!", "success");
    } catch (err: any) {
      alert("Gagal simpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "",
      recipient: profileData.name || "",
      phone: profileData.phone || "",
      city: "",
      city_id: "",
      village: "",
      address: "",
      postalCode: "",
      isDefault: addresses.length === 0,
    });
    setCitySearchInput("");
    setSelectedCityId("");
    setShowAddressModal(true);
  };

  const handleOpenEditAddressModal = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      recipient: addr.recipient,
      phone: addr.phone,
      city: addr.city,
      city_id: addr.city_id || "",
      village: addr.village || "",
      address: addr.address,
      postalCode: addr.postalCode || "",
      isDefault: addr.isDefault,
    });
    setCitySearchInput(addr.city);
    setSelectedCityId(addr.city_id || "1");
    setShowAddressModal(true);
  };

  const handleSaveAddressForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!selectedCityId && !addressForm.city) {
      alert(
        "Silakan pilih kota / kabupaten resmi dari pilihan pencarian dropdown.",
      );
      return;
    }

    let updatedList: AddressItem[] = [...addresses];
    const formattedCityDisplay = formatCityDisplay(
      addressForm.city,
      addressForm.postalCode,
      addressForm.village,
    );
    const fullAddrString = `${addressForm.address}, ${formattedCityDisplay}`;

    if (addressForm.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddressId !== null) {
      updatedList = updatedList.map((item) => {
        if (item.id === editingAddressId) {
          return {
            ...item,
            label: addressForm.label.trim(),
            recipient: addressForm.recipient.trim(),
            phone: addressForm.phone.trim(),
            city: formattedCityDisplay,
            city_id: selectedCityId || item.city_id,
            village: addressForm.village.trim(),
            address: addressForm.address.trim(),
            postalCode: addressForm.postalCode.trim(),
            isDefault: addressForm.isDefault,
          };
        }
        return item;
      });
    } else {
      const newId = Date.now();
      updatedList.push({
        id: newId,
        label: addressForm.label.trim(),
        recipient: addressForm.recipient.trim(),
        phone: addressForm.phone.trim(),
        city: formattedCityDisplay,
        city_id: selectedCityId,
        village: addressForm.village.trim(),
        address: addressForm.address.trim(),
        postalCode: addressForm.postalCode.trim(),
        isDefault: addressForm.isDefault || addresses.length === 0,
      });
    }

    setAddresses(updatedList);
    localStorage.setItem("almaco_saved_addresses", JSON.stringify(updatedList));

    const isDef = addressForm.isDefault || addresses.length === 0;
    if (isDef) {
      setProfileData((prev) => ({ ...prev, alamat: fullAddrString }));
    }

    await supabase
      .from("profiles")
      .update({
        alamat: isDef ? fullAddrString : profileData.alamat,
        daftar_alamat: updatedList,
      })
      .eq("id", userId);

    setShowAddressModal(false);
    triggerToast(
      editingAddressId !== null
        ? "Alamat pengiriman berhasil diperbarui!"
        : "Alamat baru berhasil ditambahkan!",
      "success",
    );
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!userId) return;
    const selected = addresses.find((a) => a.id === id);
    if (!selected) return;

    const updated = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("almaco_saved_addresses", JSON.stringify(updated));

    const fullAddrString = `${selected.address}, ${selected.city}`;
    setProfileData((prev) => ({ ...prev, alamat: fullAddrString }));

    await supabase
      .from("profiles")
      .update({
        alamat: fullAddrString,
        daftar_alamat: updated,
      })
      .eq("id", userId);

    triggerToast("Alamat utama berhasil diperbarui!", "info");
  };

  const confirmDeleteAddress = async () => {
    if (!userId || !addressToDelete) return;

    const updated = addresses.filter((item) => item.id !== addressToDelete);
    setAddresses(updated);
    localStorage.setItem("almaco_saved_addresses", JSON.stringify(updated));

    await supabase
      .from("profiles")
      .update({ daftar_alamat: updated })
      .eq("id", userId);

    setAddressToDelete(null);
    triggerToast("Alamat berhasil dihapus!", "danger");
  };

  const handleChangePassword = async (e: React.FormEvent, newPass: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPass,
      });
      if (error) throw error;
      triggerToast("KATA SANDI BERHASIL DIPERBARUI!", "success");
    } catch (err: any) {
      alert(err.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("almaco_saved_addresses");
      localStorage.removeItem("almaco_user_email");
      localStorage.removeItem("almaco_user_id");
      localStorage.removeItem("almaco_user_name");
      router.replace("/auth");
    } catch (err) {
      router.replace("/auth");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <p className="text-xs uppercase tracking-widest font-bold text-neutral-500">
          Memuat Profil Akun...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white justify-between overflow-x-hidden relative">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0"
          >
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
                <span className="font-black">ALMACO</span>{" "}
                <span className="font-light text-neutral-500">FASHION</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium tracking-wide block truncate">
                Fashionable • Syari • Berkualitas
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 hover:text-white bg-white hover:bg-neutral-950 border border-neutral-300 hover:border-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs shrink-0 rounded-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Kembali</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProfileToast
          show={showSaveToast}
          message={toastMessage}
          type={toastType}
        />

        <div className="bg-white border border-neutral-200 p-5 sm:p-8 mb-5 sm:mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 rounded-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-neutral-950 text-white border-2 border-neutral-300 flex items-center justify-center text-2xl sm:text-3xl font-black uppercase shadow-inner shrink-0">
              {profileData.name.charAt(0) || "U"}
            </div>

            <div className="space-y-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wide text-neutral-950 truncate">
                {profileData.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                ID: {userId ? userId.slice(0, 8) : "MEMBER"}
              </p>

              <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate max-w-[220px]">
                    {profileData.email}
                  </span>
                </span>
                {profileData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{profileData.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-rose-300 hover:border-rose-600 hover:bg-rose-50 text-rose-700 bg-white px-4 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer rounded-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {unpaidCount > 0 && firstUnpaid && (
          <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-300/80 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs animate-pulse">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700">
                    Ada {unpaidCount} Tagihan Menunggu Pembayaran
                  </span>
                  <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.2 rounded-full">
                    PENTING
                  </span>
                </div>
                <p className="text-xs text-neutral-700 leading-snug">
                  Invoice{" "}
                  <strong className="font-mono text-neutral-950 font-bold">
                    {firstUnpaid.invoice_no}
                  </strong>{" "}
                  sebesar{" "}
                  <strong className="font-mono text-amber-950 font-black">
                    Rp {(firstUnpaid.total_harga || 0).toLocaleString("id-ID")}
                  </strong>{" "}
                  belum diselesaikan. Silakan konfirmasi bukti transfer agar
                  pesanan diproses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setActiveSubTab("pesanan")}
                className="flex-1 sm:flex-initial text-center px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-2xs transition"
              >
                Lihat Semua ({unpaidCount})
              </button>
              <Link
                href={`/konfirmasi-pembayaran?invoice=${firstUnpaid.invoice_no}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-2xs transition shadow-xs active:scale-95"
              >
                <span>Bayar Sekarang</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white border border-neutral-200 shadow-xs rounded-xs overflow-hidden">
          <div className="flex border-b border-neutral-200 bg-neutral-50/70 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("pesanan")}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer relative ${
                activeSubTab === "pesanan"
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Pesanan Saya ({orders.length})</span>
              {unpaidCount > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {unpaidCount} Belum Bayar
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("biodata")}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeSubTab === "biodata"
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Biodata Diri</span>
            </button>


            <button
              onClick={() => setActiveSubTab("alamat")}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeSubTab === "alamat"
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Alamat Pengiriman ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("keamanan")}
              className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeSubTab === "keamanan"
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Keamanan & Password</span>
            </button>
          </div>

          {activeSubTab === "biodata" && (
            <TabBiodata
              profileData={profileData}
              setProfileData={setProfileData}
              onSaveProfile={handleSaveProfile}
              isSaving={isSaving}
            />
          )}

          {activeSubTab === "pesanan" && (
            <TabPesanan
              orders={orders}
              isLoadingOrders={isLoadingOrders}
              unpaidCount={unpaidCount}
            />
          )}

          {activeSubTab === "alamat" && (
            <TabAlamat
              addresses={addresses}
              onOpenAddModal={handleOpenAddAddressModal}
              onOpenEditModal={handleOpenEditAddressModal}
              onSetDefault={handleSetDefaultAddress}
              onConfirmDelete={(id) => setAddressToDelete(id)}
            />
          )}

          {activeSubTab === "keamanan" && (
            <TabKeamanan
              onChangePassword={handleChangePassword}
              isSaving={isSaving}
            />
          )}
        </div>
      </main>

      <ModalAddressForm
        show={showAddressModal}
        editingId={editingAddressId}
        form={addressForm}
        setForm={setAddressForm}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleSaveAddressForm}
        citySearchInput={citySearchInput}
        setCitySearchInput={setCitySearchInput}
        selectedCityId={selectedCityId}
        setSelectedCityId={setSelectedCityId}
        cityResults={cityResults}
        isSearchingCity={isSearchingCity}
        showCityDropdown={showCityDropdown}
        setShowCityDropdown={setShowCityDropdown}
        onCitySearchChange={handleCitySearchChange}
        onSelectCity={handleSelectCity}
      />

      <ModalDeleteAddress
        show={addressToDelete !== null}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDeleteAddress}
      />

      <ModalLogout
        show={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />

      <Footer />
    </div>
  );
}
