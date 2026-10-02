"use client";

import React, { useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export interface RajaOngkirCity {
  city_id: string;
  province: string;
  type?: string;
  city_name: string;
  postal_code?: string;
}

interface AddressFormData {
  label: string;
  recipient: string;
  phone: string;
  city: string;
  city_id: string;
  village: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

interface ModalAddressFormProps {
  show: boolean;
  editingId: number | null;
  form: AddressFormData;
  setForm: React.Dispatch<React.SetStateAction<AddressFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  citySearchInput: string;
  setCitySearchInput: (val: string) => void;
  selectedCityId: string;
  setSelectedCityId: (val: string) => void;
  cityResults: RajaOngkirCity[];
  isSearchingCity: boolean;
  showCityDropdown: boolean;
  setShowCityDropdown: (show: boolean) => void;
  onCitySearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectCity: (city: RajaOngkirCity) => void;
}

export default function ModalAddressForm({
  show,
  editingId,
  form,
  setForm,
  onClose,
  onSubmit,
  citySearchInput,
  cityResults,
  isSearchingCity,
  showCityDropdown,
  setShowCityDropdown,
  onCitySearchChange,
  onSelectCity,
}: ModalAddressFormProps) {
  const cityDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowCityDropdown]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white border border-neutral-200 shadow-2xl p-5 sm:p-8 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto rounded-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-neutral-100 pb-2.5">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
            {editingId !== null
              ? "Edit Alamat Pengiriman"
              : "Tambah Alamat Pengiriman"}
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-500">
            Lengkapi detail alamat tujuan paket belanja Anda.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
              Label Alamat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rumah, Kantor, Kos"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
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
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
                }
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
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
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
              />
            </div>
          </div>

          <div className="space-y-1 relative" ref={cityDropdownRef}>
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
              Alamat tujuan (Ketik Kecamatan/Kota){" "}
              <span className="text-red-500">*(Pilih Dari List)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={citySearchInput}
                onChange={onCitySearchChange}
                onFocus={() =>
                  cityResults.length > 0 && setShowCityDropdown(true)
                }
                placeholder="Ketik nama kota atau kabupaten..."
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs pr-9"
              />
              {isSearchingCity && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                </div>
              )}
            </div>

            {showCityDropdown && cityResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-300 shadow-xl z-50 max-h-48 overflow-y-auto rounded-2xs">
                {cityResults.map((c, idx) => (
                  <div
                    key={`${c.city_id}-${idx}`}
                    onClick={() => onSelectCity(c)}
                    className="p-2.5 hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-none text-left"
                  >
                    <p className="text-xs font-bold text-neutral-900">
                      {c.type ? `${c.type} ` : ""}
                      {c.city_name}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {c.province} • Kodepos: {c.postal_code || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
              Kecamatan / Desa
            </label>
            <input
              type="text"
              placeholder="Contoh: SEGUNUNG / DLANGGU"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
              Alamat Lengkap (Jalan, RT/RW, Patokan){" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Contoh: Jl. Mergayu No. 12, RT 01/RW 02, Kiri masjid"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
              Kode Pos
            </label>
            <input
              type="text"
              placeholder="Contoh: 61371"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white rounded-2xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="makeDefault"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
            <label
              htmlFor="makeDefault"
              className="text-xs text-neutral-700 cursor-pointer select-none"
            >
              Jadikan sebagai alamat utama
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider py-2.5 transition text-center cursor-pointer rounded-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 transition text-center shadow-xs cursor-pointer rounded-2xs"
            >
              {editingId !== null ? "Simpan Perubahan" : "Simpan Alamat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
