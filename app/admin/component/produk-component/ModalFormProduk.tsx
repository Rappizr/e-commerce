"use client";

import React from "react";
import Image from "next/image";
import {
  PackagePlus,
  X,
  Upload,
  Plus,
  Scale,
  Palette,
  Check,
  Loader2,
} from "lucide-react";

interface ModalFormProdukProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  isEditMode: boolean;
  isSubmitting: boolean;
  isCompressing: boolean;
  formProduk: any;
  setFormProduk: React.Dispatch<React.SetStateAction<any>>;
  handleAddSubmit: (e: React.FormEvent) => void;
  handleMultipleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveSingleImage: (index: number) => void;
  handleSetPrimaryImage: (index: number) => void;
  handleHargaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStokWarnaChange: (warna: string, rawVal: string) => void;
  handleAddCustomColor: (e?: React.SyntheticEvent) => void;
  handleRemoveColor: (warna: string) => void;
  inputWarnaBaru: string;
  setInputWarnaBaru: (val: string) => void;
  kategoriList: string[];
  newKategoriInput: string;
  setNewKategoriInput: (val: string) => void;
  showAddKategoriInput: boolean;
  setShowAddKategoriInput: (show: boolean) => void;
  handleAddKategori: () => void;
  setDeleteKategoriTarget: (kat: string | null) => void;
  ukuranList: string[];
  newUkuranInput: string;
  setNewUkuranInput: (val: string) => void;
  showAddUkuranInput: boolean;
  setShowAddUkuranInput: (show: boolean) => void;
  handleAddUkuran: () => void;
  activeWarnaList: string[];
  totalStokTerhitung: number;
}

export default function ModalFormProduk({
  showAddModal,
  setShowAddModal,
  isEditMode,
  isSubmitting,
  isCompressing,
  formProduk,
  setFormProduk,
  handleAddSubmit,
  handleMultipleImageUpload,
  handleRemoveSingleImage,
  handleSetPrimaryImage,
  handleHargaChange,
  handleStokWarnaChange,
  handleAddCustomColor,
  handleRemoveColor,
  inputWarnaBaru,
  setInputWarnaBaru,
  kategoriList,
  newKategoriInput,
  setNewKategoriInput,
  showAddKategoriInput,
  setShowAddKategoriInput,
  handleAddKategori,
  setDeleteKategoriTarget,
  ukuranList,
  newUkuranInput,
  setNewUkuranInput,
  showAddUkuranInput,
  setShowAddUkuranInput,
  handleAddUkuran,
  activeWarnaList,
  totalStokTerhitung,
}: ModalFormProdukProps) {
  if (!showAddModal) return null;

  const isGrosirForm = formProduk.tipeProduk === "grosir";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0"
        onClick={() => !isSubmitting && setShowAddModal(false)}
      />
      <div className="relative z-10 bg-white border border-stone-200 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col rounded-xs">
        <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
              <PackagePlus className="w-4 h-4 text-amber-900" />
              <span>
                {isEditMode ? "Edit Data Busana" : "Tambah Produk Busana Baru"}
              </span>
            </h3>
          </div>
          <button
            disabled={isSubmitting}
            onClick={() => setShowAddModal(false)}
            className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleAddSubmit}
          className="p-3.5 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs"
        >
          {/* PILIHAN TIPE PRODUK */}
          <div className="p-3 bg-[#FAF8F5] border border-stone-300 rounded-xs space-y-2">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-900 block">
              Tipe Katalog Produk:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 border rounded-2xs cursor-pointer transition ${
                  !isGrosirForm
                    ? "bg-white border-neutral-950 ring-1 ring-neutral-950 shadow-xs"
                    : "bg-stone-50 border-stone-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipeProduk"
                  value="ecer"
                  checked={!isGrosirForm}
                  onChange={() =>
                    setFormProduk({ ...formProduk, tipeProduk: "ecer" })
                  }
                  className="accent-neutral-950"
                />
                <div>
                  <span className="font-bold text-neutral-950 text-xs block">
                    Produk Eceran
                  </span>
                  <span className="text-[9.5px] text-stone-500 block">
                    Pembeli bisa pilih warna satuan
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 border rounded-2xs cursor-pointer transition ${
                  isGrosirForm
                    ? "bg-amber-50/70 border-amber-900 ring-1 ring-amber-900 shadow-xs"
                    : "bg-stone-50 border-stone-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipeProduk"
                  value="grosir"
                  checked={isGrosirForm}
                  onChange={() =>
                    setFormProduk({ ...formProduk, tipeProduk: "grosir" })
                  }
                  className="accent-amber-950"
                />
                <div>
                  <span className="font-bold text-amber-950 text-xs block">
                    Produk Seri Grosir
                  </span>
                  <span className="text-[9.5px] text-amber-800/80 block">
                    Paket campur warna (kelipatan seri)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* UPLOAD FOTO MULTIPLE HD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                Foto Produk HD ({formProduk.gambarList.length}/5)
              </label>
              {isCompressing ? (
                <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memproses Foto
                  HD...
                </span>
              ) : (
                <label className="text-[10px] font-bold text-amber-900 hover:underline cursor-pointer inline-flex items-center gap-0.5">
                  <Plus className="w-3 h-3" />
                  <span>Tambah Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {formProduk.gambarList.map((imgSrc: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] bg-neutral-100 border border-stone-300 overflow-hidden group rounded-2xs"
                >
                  <Image
                    src={imgSrc}
                    alt={`Foto ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 25vw, 120px"
                    className="object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute top-1 left-1 bg-neutral-950 text-white text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-2xs">
                      Sampul
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="absolute top-1 left-1 bg-white/90 text-neutral-900 text-[7px] font-bold uppercase px-1 py-0.5 rounded-2xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleImage(idx)}
                    className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {formProduk.gambarList.length < 5 && (
                <label className="aspect-[3/4] border border-dashed border-stone-300 hover:border-amber-900 bg-[#FAF8F5] flex flex-col items-center justify-center p-2 text-center cursor-pointer transition rounded-2xs">
                  <Upload className="w-4 h-4 text-stone-400 mb-0.5" />
                  <span className="text-[9px] font-bold text-neutral-700">
                    Unggah HD
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* NAMA PRODUK */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-0.5 whitespace-nowrap">
              <span>Nama Model Busana</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                isGrosirForm
                  ? "Contoh: [SERI 5 PCS] Daster Midi Rayon Adem"
                  : "Contoh: Daster Midi Rayon Adem Satuan"
              }
              value={formProduk.nama}
              onChange={(e) =>
                setFormProduk({ ...formProduk, nama: e.target.value })
              }
              className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs transition-colors"
            />
          </div>

          {/* PILIHAN UKURAN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-0.5 whitespace-nowrap">
                <span>Pilih Ukuran Busana (1 Katalog 1 Ukuran)</span>
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddUkuranInput(!showAddUkuranInput)}
                className="text-[10px] font-bold text-amber-900 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{showAddUkuranInput ? "Tutup" : "Ukuran Baru"}</span>
              </button>
            </div>

            {showAddUkuranInput && (
              <div className="flex gap-1.5 p-1.5 bg-[#FAF8F5] border border-stone-200 rounded-2xs">
                <input
                  type="text"
                  placeholder="Cth: Jumbo (LD 125 cm)..."
                  value={newUkuranInput}
                  onChange={(e) => setNewUkuranInput(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 px-2.5 py-1 text-xs focus:outline-none focus:border-amber-900 rounded-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddUkuran}
                  className="px-3 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase cursor-pointer rounded-2xs transition"
                >
                  Simpan
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {ukuranList.map((uk) => {
                const isSelected = formProduk.ukuranTeks === uk;
                return (
                  <button
                    key={uk}
                    type="button"
                    onClick={() =>
                      setFormProduk({ ...formProduk, ukuranTeks: uk })
                    }
                    className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition select-none rounded-2xs ${
                      isSelected
                        ? "bg-neutral-950 text-amber-100 border-neutral-950 shadow-2xs"
                        : "bg-[#FAF8F5] text-neutral-700 border-stone-200 hover:border-stone-400 hover:bg-white"
                    }`}
                  >
                    {uk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOBOT & HARGA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1 whitespace-nowrap">
                <Scale className="w-3 h-3 text-stone-500 shrink-0" />
                <span>Berat Kirim Per Pcs (Gram)</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Cth: 100"
                value={formProduk.berat}
                onChange={(e) =>
                  setFormProduk({ ...formProduk, berat: e.target.value })
                }
                className="w-full bg-[#FAF8F5] border border-stone-300 px-2.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-bold font-mono rounded-2xs transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-0.5 whitespace-nowrap">
                <span>
                  {isGrosirForm
                    ? "Harga Grosir / Pcs (Rp)"
                    : "Harga Eceran Satuan (Rp)"}
                </span>
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder={isGrosirForm ? "Cth: 55000" : "Cth: 85000"}
                value={formProduk.harga}
                onChange={handleHargaChange}
                className="w-full bg-[#FAF8F5] border border-stone-300 px-2.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-bold font-mono rounded-2xs transition-colors"
              />
            </div>
          </div>

          {/* KETENTUAN SERI GROSIR */}
          {isGrosirForm && (
            <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs uppercase tracking-wider">
                <span>Ketentuan Paket Seri Grosir</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-0.5">
                    <span>Isi 1 Seri (Min. Pcs)</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="2"
                    placeholder="Cth: 5"
                    value={formProduk.min_grosir}
                    onChange={(e) =>
                      setFormProduk({
                        ...formProduk,
                        min_grosir: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-amber-300 px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-amber-950 rounded-2xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-0.5">
                    <span>Total Stok Grosir (Pcs)</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cth: 50"
                    value={formProduk.stokGrosirPcs}
                    onChange={(e) =>
                      setFormProduk({
                        ...formProduk,
                        stokGrosirPcs: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-amber-300 px-2.5 py-1.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-amber-950 rounded-2xs"
                    required
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-amber-900/80">
                *Warna otomatis tercatat sebagai "Seri Mix (Campur Warna)" dan
                pembeli langsung membeli kelipatan {formProduk.min_grosir} pcs.
              </p>
            </div>
          )}

          {/* KATEGORI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-0.5">
                <span>Kategori</span>
                <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddKategoriInput(!showAddKategoriInput)}
                className="text-[10px] font-bold text-amber-900 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{showAddKategoriInput ? "Tutup" : "Kategori Baru"}</span>
              </button>
            </div>

            {showAddKategoriInput && (
              <div className="flex gap-1.5 p-1.5 bg-[#FAF8F5] border border-stone-200 rounded-2xs">
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={newKategoriInput}
                  onChange={(e) => setNewKategoriInput(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 px-2.5 py-1 text-xs focus:outline-none focus:border-amber-900 rounded-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddKategori}
                  className="px-3 py-1 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase cursor-pointer rounded-2xs transition"
                >
                  Simpan
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {kategoriList.map((kat) => {
                const isSelected = formProduk.kategori === kat;
                return (
                  <div
                    key={kat}
                    onClick={() =>
                      setFormProduk({ ...formProduk, kategori: kat })
                    }
                    className={`group relative inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold uppercase cursor-pointer transition select-none rounded-2xs ${
                      isSelected
                        ? "bg-neutral-950 text-amber-100 border-neutral-950 shadow-2xs"
                        : "bg-[#FAF8F5] text-neutral-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <span>{kat}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteKategoriTarget(kat);
                      }}
                      className="p-0.5 rounded hover:bg-rose-600 hover:text-white transition opacity-50 group-hover:opacity-100"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INPUT WARNA KHUSUS ECERAN */}
          {!isGrosirForm && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-stone-500" />
                    <span>
                      Pilihan Warna Satuan ({formProduk.warnaList.length}{" "}
                      Terdaftar)
                    </span>
                  </label>
                </div>

                {formProduk.warnaList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-stone-200 rounded-2xs">
                    {formProduk.warnaList.map((warna: string) => (
                      <span
                        key={warna}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 text-neutral-900 text-[10px] font-bold uppercase shadow-2xs rounded-2xs"
                      >
                        <span>{warna}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(warna)}
                          className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ketik nama warna satuan (cth: Hitam, Merah, Navy, Kubus)..."
                    value={inputWarnaBaru}
                    onChange={(e) => setInputWarnaBaru(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    className="flex-1 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomColor()}
                    className="px-3 py-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-[10px] font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1 cursor-pointer rounded-2xs"
                  >
                    <Plus className="w-3 h-3 text-amber-300" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* TABEL STOK PER WARNA */}
              <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                    Input Stok Satuan ({formProduk.ukuranTeks || "All Size"})
                  </label>
                  <span className="text-[10.5px] font-bold text-amber-950 font-mono">
                    Total: {totalStokTerhitung} pcs
                  </span>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-2xs bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-bold uppercase text-neutral-600">
                      <tr>
                        <th className="p-2.5 pl-3">Warna Busana</th>
                        <th className="p-2.5 text-center w-28">
                          Jumlah Stok (Pcs)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {activeWarnaList.map((warna) => {
                        const key = warna.trim().toUpperCase();
                        const val = formProduk.stokPerWarna[key];
                        return (
                          <tr key={warna} className="hover:bg-[#FCFAF7]">
                            <td className="p-2 pl-3 font-bold uppercase text-neutral-900 whitespace-nowrap">
                              {warna}
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={
                                  val === 0 || val === undefined
                                    ? "0"
                                    : String(val)
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    handleStokWarnaChange(warna, "");
                                  }
                                }}
                                onChange={(e) =>
                                  handleStokWarnaChange(warna, e.target.value)
                                }
                                className="w-20 bg-[#FAF8F5] border border-stone-300 text-center py-1 text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs mx-auto"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* DESKRIPSI */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
              Deskripsi Produk
            </label>
            <textarea
              rows={2}
              value={formProduk.deskripsi}
              onChange={(e) =>
                setFormProduk({ ...formProduk, deskripsi: e.target.value })
              }
              placeholder="Deskripsi singkat busana..."
              className="w-full bg-[#FAF8F5] border border-stone-300 p-2.5 text-xs focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs transition-colors"
            />
          </div>

          {/* RINCIAN DETAIL */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
              Rincian Detail (Poin-poin per baris)
            </label>
            <textarea
              rows={2}
              value={formProduk.rincianText}
              onChange={(e) =>
                setFormProduk({
                  ...formProduk,
                  rincianText: e.target.value,
                })
              }
              placeholder={`Contoh:\nBahan rayon adem & lembut\nJahitan rapi kelas butik`}
              className="w-full bg-[#FAF8F5] border border-stone-300 p-2.5 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-mono rounded-2xs transition-colors"
            />
          </div>

          {/* FOOTER ACTION MODAL */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 sticky bottom-0 bg-white">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer rounded-2xs disabled:opacity-40"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition cursor-pointer rounded-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEditMode ? "Simpan Perubahan" : "Terbitkan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
