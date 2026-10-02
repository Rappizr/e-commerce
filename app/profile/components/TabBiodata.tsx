"use client";

import React from "react";
import { Save, Loader2 } from "lucide-react";

interface TabBiodataProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    alamat: string;
  };
  setProfileData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      phone: string;
      alamat: string;
    }>
  >;
  onSaveProfile: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export default function TabBiodata({
  profileData,
  setProfileData,
  onSaveProfile,
  isSaving,
}: TabBiodataProps) {
  return (
    <form
      onSubmit={onSaveProfile}
      className="p-5 sm:p-8 space-y-4 sm:space-y-6 max-w-3xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
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
            onChange={(e) =>
              setProfileData({ ...profileData, phone: e.target.value })
            }
            placeholder="081234567890"
            className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
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
          className="w-full bg-neutral-100 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-500 cursor-not-allowed rounded-2xs"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
          Alamat Lengkap Rumah
        </label>
        <textarea
          rows={3}
          value={profileData.alamat}
          onChange={(e) =>
            setProfileData({ ...profileData, alamat: e.target.value })
          }
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
          className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
        />
      </div>

      <div className="pt-3 border-t border-neutral-100">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-2xs"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "Menyimpan..." : "Simpan Biodata"}</span>
        </button>
      </div>
    </form>
  );
}
