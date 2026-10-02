"use client";

import React from "react";
import Link from "next/link";
import { User, MapPin, Loader2 } from "lucide-react";

export interface RajaOngkirCity {
  city_id: string;
  province: string;
  type?: string;
  city_name: string;
  postal_code?: string;
}

interface DataPenerimaFormProps {
  currentUserId: string | null;
  nama: string;
  setNama: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  alamat: string;
  setAlamat: (val: string) => void;
  searchCityInput: string;
  handleCitySearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cityResults: RajaOngkirCity[];
  isSearchingCity: boolean;
  showCityDropdown: boolean;
  setShowCityDropdown: (val: boolean) => void;
  handleSelectCity: (city: RajaOngkirCity) => void;
  cityDropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function DataPenerimaForm({
  currentUserId,
  nama,
  setNama,
  whatsapp,
  setWhatsapp,
  alamat,
  setAlamat,
  searchCityInput,
  handleCitySearchChange,
  cityResults,
  isSearchingCity,
  showCityDropdown,
  setShowCityDropdown,
  handleSelectCity,
  cityDropdownRef,
}: DataPenerimaFormProps) {
  return (
    <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5 shadow-xs rounded-xs">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-neutral-800" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
            DATA PENERIMA
          </h2>
        </div>
        {currentUserId && (
          <Link
            href="/profile"
            className="text-[10px] text-neutral-500 hover:text-neutral-950 underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" /> Kelola Alamat Profil
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
            NAMA PENERIMA <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama Lengkap"
            className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
            NO WHATSAPP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="081234567890"
            className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
          />
        </div>
      </div>

      <div className="space-y-1 relative" ref={cityDropdownRef}>
        <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
          KOTA / KABUPATEN TUJUAN{" "}
          <span className="text-red-500">*(KETIK MIN. 3 HURUF)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={searchCityInput}
            onChange={handleCitySearchChange}
            onFocus={() => cityResults.length > 0 && setShowCityDropdown(true)}
            placeholder="Contoh: Kecamatan / Kabupaten / Kota"
            className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 pr-9 rounded-2xs"
          />
          {isSearchingCity && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            </div>
          )}
        </div>

        {showCityDropdown && cityResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-300 shadow-xl z-[45] max-h-52 overflow-y-auto rounded-2xs">
            {cityResults.map((c, idx) => (
              <div
                key={`${c.city_id}-${idx}`}
                onClick={() => handleSelectCity(c)}
                className="p-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-none text-left"
              >
                <p className="text-xs font-bold text-neutral-900">
                  {c.type ? `${c.type} ` : ""}
                  {c.city_name}
                </p>
                <p className="text-[10px] text-neutral-500">
                  Provinsi: {c.province} • Kodepos: {c.postal_code || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
          DETAIL ALAMAT LENGKAP <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          required
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Nama jalan, nomor bangunan, patokan..."
          className="w-full bg-neutral-50 border border-neutral-200 px-3.5 py-2 sm:py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 rounded-2xs"
        />
      </div>
    </div>
  );
}
