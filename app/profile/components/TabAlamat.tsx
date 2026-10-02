"use client";

import React from "react";
import { Plus, Check, Pencil, Trash2 } from "lucide-react";

export interface AddressItem {
  id: number;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  city_id?: string;
  village?: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

interface TabAlamatProps {
  addresses: AddressItem[];
  onOpenAddModal: () => void;
  onOpenEditModal: (addr: AddressItem) => void;
  onSetDefault: (id: number) => void;
  onConfirmDelete: (id: number) => void;
}

export default function TabAlamat({
  addresses,
  onOpenAddModal,
  onOpenEditModal,
  onSetDefault,
  onConfirmDelete,
}: TabAlamatProps) {
  return (
    <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
            Daftar Alamat Pengiriman
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Alamat utama digunakan otomatis saat Anda checkout pesanan.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition shadow-xs shrink-0 cursor-pointer rounded-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Alamat Baru</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 p-8 text-center text-neutral-400 text-xs rounded-2xs">
          Belum ada alamat tambahan yang tersimpan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border p-4 sm:p-5 space-y-3 relative flex flex-col justify-between transition-shadow hover:shadow-xs rounded-2xs ${
                addr.isDefault
                  ? "border-neutral-950 ring-1 ring-neutral-950 bg-neutral-50/40"
                  : "border-neutral-200"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="bg-neutral-950 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-2xs">
                      Utama
                    </span>
                  )}
                </div>

                <div className="text-[11px] sm:text-xs text-neutral-600 space-y-0.5 leading-relaxed">
                  <p className="font-bold text-neutral-900">
                    {addr.recipient}{" "}
                    <span className="text-neutral-500 font-normal">
                      ({addr.phone})
                    </span>
                  </p>
                  <p className="text-neutral-700">{addr.address}</p>
                  <p className="text-neutral-500">
                    {addr.city} {addr.postalCode ? `- ${addr.postalCode}` : ""}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => onSetDefault(addr.id)}
                    className="text-[10px] sm:text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-2 uppercase tracking-wider cursor-pointer"
                  >
                    Jadikan Utama
                  </button>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Alamat Aktif
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(addr)}
                    className="text-neutral-500 hover:text-neutral-950 transition-colors p-1 cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                    title="Edit Alamat"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onConfirmDelete(addr.id)}
                    className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Hapus Alamat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
