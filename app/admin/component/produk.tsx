"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  X,
  Check,
  Upload,
  PackagePlus,
  Palette,
  Loader2,
  Scale,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";

export interface ProdukItem {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  berat: number;
  deskripsi: string;
  is_grosir?: boolean;
  min_grosir?: number | null;
  harga_grosir?: number | null;
  rincian: string[];
  warna: string[];
  ukuran: string[];
  gambarList: string[];
  gambarUtama: string;
}

const compressImage = (
  file: File,
  maxDimension = 700,
  quality = 0.6,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function ProdukComponent() {
  const [produk, setProduk] = useState<ProdukItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdukFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const mappedProducts: ProdukItem[] = data.map((p: any) => ({
          id: p.id,
          nama: p.nama || "Busana Almaco",
          kategori: p.kategori || "Daster",
          harga: Number(p.harga || 0),
          stok: Number(p.stok || 0),
          berat: Number(p.berat || 0),
          deskripsi: p.deskripsi || "",
          is_grosir: Boolean(p.is_grosir),
          min_grosir: p.min_grosir ? Number(p.min_grosir) : null,
          harga_grosir: p.harga_grosir ? Number(p.harga_grosir) : null,
          rincian: Array.isArray(p.rincian) ? p.rincian : [],
          warna: Array.isArray(p.warna) ? p.warna : [],
          ukuran: Array.isArray(p.ukuran) ? p.ukuran : [],
          gambarList: Array.isArray(p.gambar_list)
            ? p.gambar_list
            : p.gambar_utama
              ? [p.gambar_utama]
              : [],
          gambarUtama: p.gambar_utama || "",
        }));
        setProduk(mappedProducts);
      }
    } catch (e) {
      console.error("Fetch Supabase Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdukFromSupabase();
  }, []);

  const [deleteTarget, setDeleteTarget] = useState<ProdukItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ProdukItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [kategoriList, setKategoriList] = useState<string[]>([
    "Daster",
    "Gamis",
    "Setcel",
    "Abaya",
  ]);
  const [newKategoriInput, setNewKategoriInput] = useState("");
  const [showAddKategoriInput, setShowAddKategoriInput] = useState(false);
  const [deleteKategoriTarget, setDeleteKategoriTarget] = useState<
    string | null
  >(null);

  const [inputWarnaBaru, setInputWarnaBaru] = useState("");

  const [formProduk, setFormProduk] = useState({
    nama: "",
    kategori: "",
    harga: "",
    stok: "",
    berat: "",
    deskripsi: "",
    rincianText: "",
    is_grosir: false,
    min_grosir: "",
    harga_grosir: "",
    warnaList: [] as string[],
    ukuranPilihan: [] as string[],
    gambarList: [] as string[],
  });

  const ukuranTersedia = ["XS", "S", "M", "L", "XL", "XXL", "All Size"];

  const handleOpenEdit = (item: ProdukItem) => {
    setIsEditMode(true);
    setEditingItem(item);
    setFormProduk({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga ? item.harga.toLocaleString("id-ID") : "",
      stok: String(item.stok),
      berat: item.berat ? String(item.berat) : "",
      deskripsi: item.deskripsi,
      rincianText: (item.rincian || []).join("\n"),
      is_grosir: Boolean(item.is_grosir),
      min_grosir: item.min_grosir ? String(item.min_grosir) : "",
      harga_grosir: item.harga_grosir
        ? item.harga_grosir.toLocaleString("id-ID")
        : "",
      warnaList: item.warna || [],
      ukuranPilihan: item.ukuran || [],
      gambarList: item.gambarList || [],
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormProduk({
      nama: "",
      kategori: "",
      harga: "",
      stok: "",
      berat: "",
      deskripsi: "",
      rincianText: "",
      is_grosir: false,
      min_grosir: "",
      harga_grosir: "",
      warnaList: [],
      ukuranPilihan: [],
      gambarList: [],
    });
    setInputWarnaBaru("");
  };

  const [validationModal, setValidationModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: "",
    message: "",
  });

  const handleAddKategori = () => {
    const trimmed = newKategoriInput.trim();
    if (!trimmed) return;
    if (kategoriList.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      setValidationModal({
        show: true,
        title: "Kategori Sudah Ada",
        message: `Kategori "${trimmed}" sudah terdaftar dalam pilihan. Silakan pilih dari daftar yang tersedia.`,
      });
      return;
    }
    const updated = [...kategoriList, trimmed];
    setKategoriList(updated);
    setFormProduk((prev) => ({ ...prev, kategori: trimmed }));
    setNewKategoriInput("");
    setShowAddKategoriInput(false);
    setToastMessage(`Kategori "${trimmed}" berhasil ditambahkan!`);
  };

  const confirmDeleteKategori = () => {
    if (!deleteKategoriTarget) return;
    const kat = deleteKategoriTarget;
    const updated = kategoriList.filter((k) => k !== kat);
    setKategoriList(updated);
    if (formProduk.kategori === kat) {
      setFormProduk((prev) => ({ ...prev, kategori: "" }));
    }
    setDeleteKategoriTarget(null);
    setToastMessage(`Kategori "${kat}" berhasil dihapus.`);
  };

  const handleAddCustomColor = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = inputWarnaBaru.trim();
    if (!trimmed) return;

    if (
      formProduk.warnaList.some(
        (w) => w.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setInputWarnaBaru("");
      return;
    }

    setFormProduk((prev) => ({
      ...prev,
      warnaList: [...prev.warnaList, trimmed],
    }));
    setInputWarnaBaru("");
  };

  const handleRemoveColor = (warnaToRemove: string) => {
    setFormProduk((prev) => ({
      ...prev,
      warnaList: prev.warnaList.filter((w) => w !== warnaToRemove),
    }));
  };

  const handleMultipleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formProduk.gambarList.length + files.length > 5) {
      setValidationModal({
        show: true,
        title: "Batas Foto Terlampaui",
        message:
          "Maksimal 5 foto per model busana agar etalase toko tetap cepat dimuat.",
      });
      e.target.value = "";
      return;
    }

    setIsCompressing(true);
    try {
      const compressedList = await Promise.all(
        Array.from(files).map((file) => compressImage(file, 700, 0.6)),
      );

      setFormProduk((prev) => ({
        ...prev,
        gambarList: [...prev.gambarList, ...compressedList],
      }));

      setToastMessage(
        `${files.length} foto berhasil dioptimalkan dan ditambahkan.`,
      );
    } catch (err) {
      console.error(err);
      setValidationModal({
        show: true,
        title: "Gagal Memproses Foto",
        message: "Format foto tidak didukung atau ukuran file terlalu besar.",
      });
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleRemoveSingleImage = (indexToRemove: number) => {
    setFormProduk((prev) => ({
      ...prev,
      gambarList: prev.gambarList.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormProduk((prev) => {
      const selected = prev.gambarList[indexToPrimary];
      const others = prev.gambarList.filter((_, idx) => idx !== indexToPrimary);
      return {
        ...prev,
        gambarList: [selected, ...others],
      };
    });
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) {
      setFormProduk((prev) => ({ ...prev, harga: "" }));
      return;
    }
    setFormProduk((prev) => ({
      ...prev,
      harga: Number(val).toLocaleString("id-ID"),
    }));
  };

  const handleHargaGrosirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) {
      setFormProduk((prev) => ({ ...prev, harga_grosir: "" }));
      return;
    }
    setFormProduk((prev) => ({
      ...prev,
      harga_grosir: Number(val).toLocaleString("id-ID"),
    }));
  };

  const toggleUkuran = (size: string) => {
    setFormProduk((prev) => {
      const exists = prev.ukuranPilihan.includes(size);
      if (exists) {
        return {
          ...prev,
          ukuranPilihan: prev.ukuranPilihan.filter((s) => s !== size),
        };
      }
      return { ...prev, ukuranPilihan: [...prev.ukuranPilihan, size] };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProduk.nama.trim() || !formProduk.harga) {
      setValidationModal({
        show: true,
        title: "Form Belum Lengkap",
        message:
          "Mohon isi Nama Model Busana dan Harga Jual sebelum menyimpan.",
      });
      return;
    }

    if (!formProduk.kategori) {
      setValidationModal({
        show: true,
        title: "Pilih Kategori Busana",
        message:
          "Silakan klik dan pilih salah satu Kategori Busana sebelum menyimpan produk.",
      });
      return;
    }

    if (
      formProduk.is_grosir &&
      (!formProduk.min_grosir || !formProduk.harga_grosir)
    ) {
      setValidationModal({
        show: true,
        title: "Pengaturan Grosir Belum Lengkap",
        message:
          "Karena opsi Grosir diaktifkan, mohon isi Minimal Pembelian dan Harga Grosir Per Pcs.",
      });
      return;
    }

    const rawHarga = Number(formProduk.harga.replace(/[^0-9]/g, ""));
    const rawHargaGrosir =
      formProduk.is_grosir && formProduk.harga_grosir
        ? Number(formProduk.harga_grosir.replace(/[^0-9]/g, ""))
        : null;

    const parsedRincian = formProduk.rincianText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const fallbackImg =
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop";
    const finalList =
      formProduk.gambarList.length > 0 ? formProduk.gambarList : [fallbackImg];

    const payload = {
      nama: formProduk.nama.trim(),
      kategori: formProduk.kategori,
      harga: rawHarga,
      stok: Number(formProduk.stok) || 0,
      berat: formProduk.berat ? Number(formProduk.berat) : 350,
      deskripsi:
        formProduk.deskripsi.trim() ||
        "Busana modis berkualitas premium dari ALMACO FASHION.",
      is_grosir: formProduk.is_grosir,
      min_grosir:
        formProduk.is_grosir && formProduk.min_grosir
          ? Number(formProduk.min_grosir)
          : null,
      harga_grosir: rawHargaGrosir,
      rincian:
        parsedRincian.length > 0
          ? parsedRincian
          : ["Bahan premium super adem & lembut", "Jahitan rapi kelas butik"],
      warna:
        formProduk.warnaList.length > 0 ? formProduk.warnaList : ["Default"],
      ukuran:
        formProduk.ukuranPilihan.length > 0
          ? formProduk.ukuranPilihan
          : ["All Size"],
      gambar_list: finalList,
      gambar_utama: finalList[0],
    };

    try {
      if (isEditMode && editingItem) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;

        setProduk((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...payload,
                  id: editingItem.id,
                  gambarList: finalList,
                  gambarUtama: finalList[0],
                }
              : item,
          ),
        );
        setToastMessage(`Produk "${payload.nama}" berhasil diperbarui!`);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newInsertedItem: ProdukItem = {
            id: data.id,
            nama: data.nama,
            kategori: data.kategori,
            harga: Number(data.harga || 0),
            stok: Number(data.stok || 0),
            berat: Number(data.berat || 0),
            deskripsi: data.deskripsi,
            is_grosir: Boolean(data.is_grosir),
            min_grosir: data.min_grosir ? Number(data.min_grosir) : null,
            harga_grosir: data.harga_grosir ? Number(data.harga_grosir) : null,
            rincian: data.rincian || [],
            warna: data.warna || [],
            ukuran: data.ukuran || [],
            gambarList: data.gambar_list || [],
            gambarUtama: data.gambar_utama || "",
          };
          setProduk((prev) => [newInsertedItem, ...prev]);
        }
        setToastMessage(
          `Produk "${payload.nama}" berhasil diterbitkan ke katalog!`,
        );
      }

      setShowAddModal(false);
      resetForm();
    } catch (e: any) {
      console.error("Error simpan produk:", e);
      alert("Gagal menyimpan produk: " + e.message);
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    if (newStock < 0) return;
    setProduk((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stok: newStock } : p)),
    );

    try {
      const { error } = await supabase
        .from("products")
        .update({ stok: newStock })
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error("Gagal update stok:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.nama;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", targetId);
      if (error) throw error;

      setProduk((prev) => prev.filter((p) => p.id !== targetId));
      setToastMessage(`Produk "${targetName}" berhasil dihapus.`);
    } catch (e: any) {
      console.error("Error delete product from Supabase:", e);
      alert("Gagal menghapus produk: " + e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 w-full relative">
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setToastMessage(null)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 text-center space-y-4 animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5] text-amber-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-950">
                Pembaruan Berhasil
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                {toastMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="w-full bg-neutral-950 hover:bg-amber-950 text-white text-[11px] font-bold uppercase tracking-widest py-3 transition shadow-xs cursor-pointer active:scale-[0.99] rounded-2xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER KONTROL PRODUK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-stone-200 shadow-2xs rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
              Katalog Produk & Galeri Etalase
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
            Kelola data busana, foto galeri, pengaturan grosir/ecer, variasi
            warna & ukuran, bobot kirim, dan stok inventori.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-950 hover:bg-amber-950 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer rounded-2xs"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-stone-200 p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2 rounded-xs">
          <Loader2 className="w-6 h-6 animate-spin text-amber-900" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Memuat katalog produk...
          </span>
        </div>
      ) : produk.length === 0 ? (
        <div className="bg-white border border-stone-200 p-8 sm:p-14 text-center text-stone-400 space-y-3 shadow-2xs rounded-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <PackagePlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
              Katalog Busana Masih Kosong
            </p>
            <p className="text-[10px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
              Belum ada produk di katalog. Mulai tambahkan pakaian sekarang.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition shadow-xs mt-2 cursor-pointer rounded-2xs"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span>Mulai Tambah Produk</span>
          </button>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
            {produk.map((item) => (
              <div
                key={item.id}
                className={`bg-white border overflow-hidden flex flex-col justify-between shadow-2xs group transition-all duration-200 rounded-xs ${
                  item.is_grosir
                    ? "border-amber-800/30 hover:border-amber-900"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={item.gambarUtama}
                    alt={item.nama}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge Kategori */}
                  <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/95 px-2 py-0.5 border border-stone-200 text-neutral-900 shadow-2xs rounded-2xs">
                    {item.kategori}
                  </span>

                  {/* Badge Grosir Elegan */}
                  {item.is_grosir && (
                    <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-neutral-950 text-amber-200 border border-amber-700/40 px-2 py-0.5 shadow-sm flex items-center gap-1 rounded-2xs">
                      <Tag className="w-2.5 h-2.5 text-amber-300" />
                      <span>MIN {item.min_grosir || 3} PCS</span>
                    </span>
                  )}

                  <span className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider bg-neutral-950/80 text-white px-2 py-0.5 backdrop-blur-xs rounded-2xs">
                    {item.gambarList?.length || 1} Foto
                  </span>
                </div>

                <div className="p-2.5 sm:p-4 space-y-1.5">
                  <h4 className="text-[11px] sm:text-xs font-bold text-neutral-900 line-clamp-1">
                    {item.nama}
                  </h4>
                  <p className="text-[9px] sm:text-[11px] text-neutral-500 line-clamp-1">
                    {item.ukuran.join(", ")} • {item.warna.length} Warna{" "}
                    {item.berat ? `• ${item.berat} gr` : ""}
                  </p>

                  <div className="flex flex-col pt-0.5 space-y-0.5">
                    <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">
                      Ecer:{" "}
                      <strong className="text-neutral-950 font-bold font-mono">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </strong>
                    </span>

                    {item.is_grosir && item.harga_grosir && (
                      <div className="bg-[#F8F5EE] border border-amber-200/90 px-2 py-1 mt-1 flex items-center justify-between text-amber-950 rounded-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900">
                          Grosir:
                        </span>
                        <span className="text-[10.5px] sm:text-xs font-bold font-mono">
                          Rp {item.harga_grosir.toLocaleString("id-ID")}{" "}
                          <span className="text-[8.5px] font-normal text-amber-800">
                            /pcs
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border rounded-2xs ${item.stok > 0 ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}
                    >
                      Stok: {item.stok}
                    </span>
                  </div>
                </div>

                <div className="p-2 sm:p-3 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-500 hidden sm:inline">
                      Stok:
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateStock(item.id, Math.max(0, item.stok - 1))
                      }
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition cursor-pointer rounded-2xs active:bg-stone-100"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.id, item.stok + 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-white border border-stone-300 hover:border-neutral-900 text-neutral-800 font-bold text-xs flex items-center justify-center transition cursor-pointer rounded-2xs active:bg-stone-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-950 text-white hover:bg-amber-950 text-[9px] sm:text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                      title="Edit Produk"
                    >
                      <Pencil className="w-3 h-3 text-amber-300" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[9px] sm:text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT PRODUK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-10 bg-white border border-stone-200 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col rounded-xs">
            <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                  <PackagePlus className="w-4 h-4 text-amber-900" />
                  <span>
                    {isEditMode
                      ? "Edit Data Busana"
                      : "Tambah Produk Busana Baru"}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-neutral-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs"
            >
              {/* UPLOAD FOTO MULTIPLE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Foto Produk ({formProduk.gambarList.length}/5)
                  </label>
                  {isCompressing ? (
                    <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Memproses
                      Foto...
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
                  {formProduk.gambarList.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] bg-neutral-100 border border-stone-300 overflow-hidden group rounded-2xs"
                    >
                      <Image
                        src={imgSrc}
                        alt={`Foto ${idx + 1}`}
                        fill
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
                        Unggah
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
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Nama Model Busana <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daster Midi Floral Rayon Adem"
                  value={formProduk.nama}
                  onChange={(e) =>
                    setFormProduk({ ...formProduk, nama: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs transition-colors"
                />
              </div>

              {/* HARGA, STOK, BERAT */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Harga Ecer (Rp) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 85.000"
                    value={formProduk.harga}
                    onChange={handleHargaChange}
                    className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-bold font-mono rounded-2xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Stok <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 50"
                    value={formProduk.stok}
                    onChange={(e) =>
                      setFormProduk({ ...formProduk, stok: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-bold font-mono rounded-2xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-stone-500" />
                    <span>Berat (Gram)</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="Contoh: 325"
                    value={formProduk.berat}
                    onChange={(e) =>
                      setFormProduk({ ...formProduk, berat: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-stone-300 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-bold font-mono rounded-2xs transition-colors"
                  />
                </div>
              </div>

              {/* FORM PENGATURAN GROSIR */}
              <div className="p-3 bg-[#F8F5EE] border border-amber-800/30 rounded-xs space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formProduk.is_grosir}
                    onChange={(e) =>
                      setFormProduk((prev) => ({
                        ...prev,
                        is_grosir: e.target.checked,
                        min_grosir: e.target.checked
                          ? prev.min_grosir || "3"
                          : "",
                        harga_grosir: e.target.checked ? prev.harga_grosir : "",
                      }))
                    }
                    className="w-4 h-4 accent-amber-950 cursor-pointer"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-800" />
                    <span>Aktifkan Harga Grosir / Seri</span>
                  </span>
                </label>

                {formProduk.is_grosir && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-amber-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        Min. Pembelian Seri (Pcs){" "}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        min="2"
                        placeholder="Contoh: 3 atau 5"
                        value={formProduk.min_grosir}
                        onChange={(e) =>
                          setFormProduk({
                            ...formProduk,
                            min_grosir: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-amber-300 px-3 py-1.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-amber-950 rounded-2xs"
                        required={formProduk.is_grosir}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        Harga Grosir / Pcs (Rp){" "}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 55.000"
                        value={formProduk.harga_grosir}
                        onChange={handleHargaGrosirChange}
                        className="w-full bg-white border border-amber-300 px-3 py-1.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-amber-950 rounded-2xs"
                        required={formProduk.is_grosir}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* KATEGORI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Kategori <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddKategoriInput(!showAddKategoriInput)
                    }
                    className="text-[10px] font-bold text-amber-900 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>
                      {showAddKategoriInput ? "Tutup" : "Kategori Baru"}
                    </span>
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

              {/* VARIASI WARNA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-stone-500" />
                    <span>
                      Variasi Warna ({formProduk.warnaList.length} Terpilih)
                    </span>
                  </label>
                </div>

                {formProduk.warnaList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-stone-200 rounded-2xs">
                    {formProduk.warnaList.map((warna) => (
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
                    placeholder="Ketik nama warna baru..."
                    value={inputWarnaBaru}
                    onChange={(e) => setInputWarnaBaru(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    className="flex-1 bg-[#FAF8F5] border border-stone-300 px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-amber-900 rounded-2xs"
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

              {/* PILIHAN UKURAN */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Pilihan Ukuran
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ukuranTersedia.map((sz) => {
                    const isChecked = formProduk.ukuranPilihan.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleUkuran(sz)}
                        className={`px-3 py-1 text-[10px] font-bold border transition cursor-pointer rounded-2xs ${
                          isChecked
                            ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs"
                            : "bg-white text-neutral-700 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                  placeholder={`Contoh:\nBahan rayon adem & lembut\nJahitan rapi butik`}
                  className="w-full bg-[#FAF8F5] border border-stone-300 p-2.5 text-xs focus:bg-white focus:outline-none focus:border-amber-900 font-mono rounded-2xs transition-colors"
                />
              </div>

              {/* FOOTER ACTION MODAL */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer rounded-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition cursor-pointer rounded-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEditMode ? "Simpan Perubahan" : "Terbitkan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS KATEGORI */}
      {deleteKategoriTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteKategoriTarget(null)}
          />
          <div className="relative z-10 bg-white border border-stone-200 max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950 truncate">
                  Hapus Kategori
                </h3>
                <p className="text-[10px] text-neutral-500 truncate">
                  Hapus "{deleteKategoriTarget}"?
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <strong className="text-neutral-900">
                "{deleteKategoriTarget}"
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteKategoriTarget(null)}
                className="px-3.5 py-1.5 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteKategori}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase cursor-pointer rounded-2xs transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS PRODUK */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 bg-white border border-stone-200 max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 truncate">
                    Konfirmasi Hapus Produk
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                    Data akan dihapus permanen dari Supabase.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-stone-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-[#FAF8F5] border border-stone-200 flex items-center gap-3 rounded-2xs">
              <div className="relative w-10 h-10 bg-neutral-200 shrink-0 border border-stone-300 rounded-2xs overflow-hidden">
                <Image
                  src={deleteTarget.gambarUtama}
                  alt={deleteTarget.nama}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {deleteTarget.nama}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Rp {deleteTarget.harga.toLocaleString("id-ID")} • Stok:{" "}
                  {deleteTarget.stok}{" "}
                  {deleteTarget.berat
                    ? `• Berat: ${deleteTarget.berat} gr`
                    : ""}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk ini secara permanen dari
              database etalase toko?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 bg-white border border-stone-300 text-neutral-700 text-xs font-bold uppercase cursor-pointer rounded-2xs"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase cursor-pointer shadow-xs rounded-2xs transition"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERINGATAN VALIDASI */}
      {validationModal.show && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 rounded-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-800" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950">
                  {validationModal.title}
                </h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Peringatan Input Form
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setValidationModal({ show: false, title: "", message: "" })
                }
                className="text-stone-400 hover:text-neutral-900 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed bg-[#FAF8F5] p-3 border border-stone-200 rounded-2xs">
              {validationModal.message}
            </p>

            <div className="flex items-center justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() =>
                  setValidationModal({ show: false, title: "", message: "" })
                }
                className="w-full sm:w-auto px-5 py-2 bg-neutral-950 hover:bg-amber-950 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer rounded-2xs"
              >
                Paham & Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
