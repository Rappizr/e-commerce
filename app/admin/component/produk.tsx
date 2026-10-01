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
  ShoppingBag,
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
  is_grosir: boolean;
  min_grosir: number | null;
  harga_grosir: number | null;
  rincian: string[];
  warna: string[];
  ukuran: string[];
  gambarList: string[];
  gambarUtama: string;
}

// KOMPRESI TAJAM HD & ASPECT RATIO 3:4 PRESET (900x1200 px)
const compressImage = (
  file: File,
  targetWidth = 900,
  targetHeight = 1200,
  quality = 0.85,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Buat background putih murni
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Hitung rasio agar gambar utuh di dalam frame 3:4
          const hRatio = targetWidth / img.width;
          const vRatio = targetHeight / img.height;
          const ratio = Math.min(hRatio, vRatio);

          const centerShift_x = (targetWidth - img.width * ratio) / 2;
          const centerShift_y = (targetHeight - img.height * ratio) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShift_x,
            centerShift_y,
            img.width * ratio,
            img.height * ratio,
          );

          let compressedDataUrl = canvas.toDataURL("image/webp", quality);
          if (!compressedDataUrl.startsWith("data:image/webp")) {
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          canvas.width = 0;
          canvas.height = 0;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTipe, setFilterTipe] = useState<"semua" | "ecer" | "grosir">(
    "semua",
  );

  const fetchProdukFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const mappedProducts: ProdukItem[] = data.map((p: any) => ({
          id: Number(p.id),
          nama: p.nama || "Busana Almaco",
          kategori: p.kategori || "Daster",
          harga: Number(p.harga || 0),
          stok: Number(p.stok || 0),
          berat: Number(p.berat || 100),
          deskripsi: p.deskripsi || "",
          is_grosir: Boolean(p.is_grosir),
          min_grosir: p.min_grosir ? Number(p.min_grosir) : null,
          harga_grosir: p.harga_grosir ? Number(p.harga_grosir) : null,
          rincian: Array.isArray(p.rincian) ? p.rincian : [],
          warna:
            Array.isArray(p.warna) && p.warna.length > 0
              ? p.warna
              : ["Default"],
          ukuran:
            Array.isArray(p.ukuran) && p.ukuran.length > 0
              ? p.ukuran
              : ["All Size (LD 115 cm)"],
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

  // DAFTAR KATEGORI
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

  // DAFTAR UKURAN PRESET & CUSTOM
  const [ukuranList, setUkuranList] = useState<string[]>([
    "All Size (LD 115 cm)",
    "Standar (LD 105 cm)",
    "Jumbo (LD 120 cm)",
    "Super Jumbo (LD 130 cm)",
    "M",
    "L",
    "XL",
    "XXL",
  ]);
  const [newUkuranInput, setNewUkuranInput] = useState("");
  const [showAddUkuranInput, setShowAddUkuranInput] = useState(false);

  const [inputWarnaBaru, setInputWarnaBaru] = useState("");

  const [formProduk, setFormProduk] = useState({
    tipeProduk: "ecer" as "ecer" | "grosir",
    nama: "",
    kategori: "",
    harga: "",
    berat: "100",
    ukuranTeks: "All Size (LD 115 cm)",
    deskripsi: "",
    rincianText: "",
    min_grosir: "5",
    stokGrosirPcs: "50",
    warnaList: [] as string[],
    stokPerWarna: {} as { [warna: string]: number },
    gambarList: [] as string[],
  });

  const handleOpenEdit = async (item: ProdukItem) => {
    setIsEditMode(true);
    setEditingItem(item);

    const stokWarnaMap: { [warna: string]: number } = {};
    const itemWarna =
      item.warna && item.warna.length > 0 ? item.warna : ["Default"];
    const ukuranUtama =
      item.ukuran && item.ukuran.length > 0
        ? item.ukuran[0]
        : "All Size (LD 115 cm)";

    if (ukuranUtama && !ukuranList.includes(ukuranUtama)) {
      setUkuranList((prev) => [...prev, ukuranUtama]);
    }

    try {
      const { data: varData, error } = await supabase
        .from("product_variants")
        .select("warna, stok")
        .eq("product_id", Number(item.id));

      if (!error && varData && varData.length > 0) {
        varData.forEach((v: any) => {
          const w = String(v.warna || "Default")
            .trim()
            .toUpperCase();
          stokWarnaMap[w] = Number(v.stok ?? 0);
        });
      }
    } catch (err) {
      console.error("Gagal load varian:", err);
    }

    const isGrosir = Boolean(item.is_grosir);
    const hargaAktif = isGrosir ? item.harga_grosir || item.harga : item.harga;

    setFormProduk({
      tipeProduk: isGrosir ? "grosir" : "ecer",
      nama: item.nama,
      kategori: item.kategori,
      harga: hargaAktif ? hargaAktif.toLocaleString("id-ID") : "",
      berat: item.berat ? String(item.berat) : "100",
      ukuranTeks: ukuranUtama,
      deskripsi: item.deskripsi || "",
      rincianText: (item.rincian || []).join("\n"),
      min_grosir: item.min_grosir ? String(item.min_grosir) : "5",
      stokGrosirPcs: String(item.stok || 0),
      warnaList: isGrosir ? ["Seri Mix (Campur Warna)"] : itemWarna,
      stokPerWarna: stokWarnaMap,
      gambarList: item.gambarList || [],
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormProduk({
      tipeProduk: "ecer",
      nama: "",
      kategori: "",
      harga: "",
      berat: "100",
      ukuranTeks: "All Size (LD 115 cm)",
      deskripsi: "",
      rincianText: "",
      min_grosir: "5",
      stokGrosirPcs: "50",
      warnaList: [],
      stokPerWarna: {},
      gambarList: [],
    });
    setInputWarnaBaru("");
    setShowAddKategoriInput(false);
    setShowAddUkuranInput(false);
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
        message: `Kategori "${trimmed}" sudah terdaftar dalam pilihan.`,
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

  const handleAddUkuran = () => {
    const trimmed = newUkuranInput.trim();
    if (!trimmed) return;
    if (ukuranList.some((u) => u.toLowerCase() === trimmed.toLowerCase())) {
      setValidationModal({
        show: true,
        title: "Ukuran Sudah Ada",
        message: `Ukuran "${trimmed}" sudah terdaftar dalam pilihan.`,
      });
      return;
    }
    const updated = [...ukuranList, trimmed];
    setUkuranList(updated);
    setFormProduk((prev) => ({ ...prev, ukuranTeks: trimmed }));
    setNewUkuranInput("");
    setShowAddUkuranInput(false);
    setToastMessage(`Ukuran "${trimmed}" berhasil ditambahkan!`);
  };

  const handleAddCustomColor = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = inputWarnaBaru.trim().toUpperCase();
    if (!trimmed) return;

    if (formProduk.warnaList.some((w) => w.toUpperCase() === trimmed)) {
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
    setFormProduk((prev) => {
      const updatedList = prev.warnaList.filter((w) => w !== warnaToRemove);
      const updatedStok = { ...prev.stokPerWarna };
      delete updatedStok[warnaToRemove.toUpperCase()];
      return {
        ...prev,
        warnaList: updatedList,
        stokPerWarna: updatedStok,
      };
    });
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
        message: "Maksimal 5 foto per model busana.",
      });
      e.target.value = "";
      return;
    }

    setIsCompressing(true);
    try {
      const compressedList = await Promise.all(
        Array.from(files).map((file) => compressImage(file, 900, 1200, 0.85)),
      );

      setFormProduk((prev) => ({
        ...prev,
        gambarList: [...prev.gambarList, ...compressedList],
      }));
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

  const handleStokWarnaChange = (warna: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, "");
    const num = cleaned === "" ? 0 : parseInt(cleaned, 10);
    const key = warna.trim().toUpperCase();

    setFormProduk((prev) => ({
      ...prev,
      stokPerWarna: {
        ...prev.stokPerWarna,
        [key]: num,
      },
    }));
  };

  const isGrosirForm = formProduk.tipeProduk === "grosir";
  const activeWarnaList = isGrosirForm
    ? ["Seri Mix (Campur Warna)"]
    : formProduk.warnaList.length > 0
      ? formProduk.warnaList
      : ["Default"];

  const totalStokTerhitung = isGrosirForm
    ? Number(formProduk.stokGrosirPcs.replace(/[^0-9]/g, "")) || 0
    : activeWarnaList.reduce((acc, w) => {
        const key = w.trim().toUpperCase();
        return acc + (Number(formProduk.stokPerWarna[key]) || 0);
      }, 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isCompressing) return;

    if (!formProduk.nama.trim() || !formProduk.harga) {
      setValidationModal({
        show: true,
        title: "Form Belum Lengkap",
        message: "Mohon isi Nama Model Busana dan Harga.",
      });
      return;
    }

    if (!formProduk.kategori) {
      setValidationModal({
        show: true,
        title: "Pilih Kategori Busana",
        message: "Silakan pilih salah satu Kategori Busana.",
      });
      return;
    }

    if (!formProduk.ukuranTeks.trim()) {
      setValidationModal({
        show: true,
        title: "Pilih Ukuran Busana",
        message: "Silakan tentukan salah satu ukuran busana.",
      });
      return;
    }

    setIsSubmitting(true);

    const rawHarga = Number(formProduk.harga.replace(/[^0-9]/g, "")) || 0;
    const parsedMinGrosir = isGrosirForm
      ? Math.max(2, Number(formProduk.min_grosir) || 5)
      : null;

    const parsedRincian = formProduk.rincianText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const fallbackImg =
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop";
    const finalList =
      formProduk.gambarList.length > 0 ? formProduk.gambarList : [fallbackImg];

    const parsedBerat = Number(formProduk.berat);
    const validBerat =
      !isNaN(parsedBerat) && parsedBerat > 0 ? parsedBerat : 100;
    const cleanUkuran = formProduk.ukuranTeks.trim() || "All Size (LD 115 cm)";

    const payload = {
      nama: formProduk.nama.trim(),
      kategori: formProduk.kategori,
      harga: rawHarga,
      stok: totalStokTerhitung,
      berat: validBerat,
      deskripsi:
        formProduk.deskripsi.trim() ||
        (isGrosirForm
          ? "Paket grosir busana seri campur warna langsung dari konveksi ALMACO FASHION."
          : "Busana modis berkualitas premium dari ALMACO FASHION."),
      is_grosir: isGrosirForm,
      min_grosir: parsedMinGrosir,
      harga_grosir: isGrosirForm ? rawHarga : null,
      rincian:
        parsedRincian.length > 0
          ? parsedRincian
          : isGrosirForm
            ? [
                `Paket seri otomatis isi ${parsedMinGrosir} pcs beda warna`,
                "Bahan adem & jahitan konveksi rapi",
              ]
            : ["Bahan premium super adem & lembut", "Jahitan rapi kelas butik"],
      warna: activeWarnaList,
      ukuran: [cleanUkuran],
      gambar_list: finalList,
      gambar_utama: finalList[0],
    };

    try {
      let productId = editingItem?.id;

      if (isEditMode && editingItem) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", Number(editingItem.id));

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
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          productId = Number(data.id);
          const newInsertedItem: ProdukItem = {
            id: Number(data.id),
            nama: data.nama,
            kategori: data.kategori,
            harga: Number(data.harga || 0),
            stok: Number(data.stok || 0),
            berat: Number(data.berat || 100),
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
      }

      if (productId) {
        const numericId = Number(productId);

        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", numericId);

        const variantsPayload = isGrosirForm
          ? [
              {
                product_id: numericId,
                warna: "Seri Mix (Campur Warna)",
                ukuran: cleanUkuran,
                stok: totalStokTerhitung,
              },
            ]
          : activeWarnaList.map((w) => {
              const key = w.trim().toUpperCase();
              const stokVal = Number(formProduk.stokPerWarna[key]) || 0;
              return {
                product_id: numericId,
                warna: w.trim(),
                ukuran: cleanUkuran,
                stok: stokVal,
              };
            });

        if (variantsPayload.length > 0) {
          await supabase.from("product_variants").insert(variantsPayload);
        }
      }

      setToastMessage(
        isEditMode
          ? `Produk "${payload.nama}" berhasil diperbarui!`
          : `Produk "${payload.nama}" berhasil diterbitkan ke katalog!`,
      );

      setShowAddModal(false);
      resetForm();
    } catch (e: any) {
      console.error("Error simpan produk:", e);
      alert("Gagal menyimpan produk: " + (e.message || JSON.stringify(e)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = Number(deleteTarget.id);
    const targetName = deleteTarget.nama;

    try {
      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", targetId);

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

  const displayedProducts = produk.filter((p) => {
    if (filterTipe === "ecer") return !p.is_grosir;
    if (filterTipe === "grosir") return p.is_grosir;
    return true;
  });

  return (
    <div className="space-y-4 w-full relative">
      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
        }
      `}</style>

      {/* OVERLAY LOADING */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-2xl flex flex-col items-center justify-center gap-3 max-w-xs w-full text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                {isEditMode ? "Memperbarui Data..." : "Menerbitkan Produk..."}
              </h4>
              <p className="text-[10.5px] text-neutral-500">
                Menyimpan data dan foto HD ke database. Mohon tunggu sebentar.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* HEADER KONTROL PRODUK & FILTER TAB */}
      <div className="bg-white p-4 sm:p-5 border border-stone-200 shadow-2xs rounded-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xs">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                Katalog Produk (Eceran & Seri Grosir Terpisah)
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
              Kelola etalase pakaian satuan (ecer) dan paket seri grosir
              konveksi secara terpisah.
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

        {/* TAB FILTER TIPE */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setFilterTipe("semua")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition cursor-pointer ${
              filterTipe === "semua"
                ? "bg-neutral-950 text-white shadow-2xs"
                : "bg-stone-50 text-neutral-600 hover:bg-stone-100"
            }`}
          >
            Semua ({produk.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTipe("ecer")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition flex items-center gap-1 cursor-pointer ${
              filterTipe === "ecer"
                ? "bg-neutral-950 text-white shadow-2xs"
                : "bg-stone-50 text-neutral-600 hover:bg-stone-100"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              Eceran Satuan ({produk.filter((p) => !p.is_grosir).length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTipe("grosir")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-2xs transition flex items-center gap-1 cursor-pointer ${
              filterTipe === "grosir"
                ? "bg-amber-900 text-white shadow-2xs"
                : "bg-amber-50 text-amber-950 hover:bg-amber-100"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>
              Seri Grosir ({produk.filter((p) => p.is_grosir).length})
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-stone-200 p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2 rounded-xs">
          <Loader2 className="w-6 h-6 animate-spin text-amber-900" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Memuat katalog produk...
          </span>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 p-8 sm:p-14 text-center text-stone-400 space-y-3 shadow-2xs rounded-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <PackagePlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
              Tidak Ada Produk {filterTipe.toUpperCase()}
            </p>
            <p className="text-[10px] sm:text-xs text-neutral-500 max-w-sm mx-auto">
              Belum ada produk di kategori filter ini. Mulai tambahkan busana
              sekarang.
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
            <span>Tambah Produk</span>
          </button>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
            {displayedProducts.map((item) => (
              <div
                key={item.id}
                className={`bg-white border overflow-hidden flex flex-col justify-between shadow-2xs group transition-all duration-200 rounded-xs ${
                  item.is_grosir
                    ? "border-amber-800/40 hover:border-amber-900"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={item.gambarUtama}
                    alt={item.nama}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-white/95 px-2 py-0.5 border border-stone-200 text-neutral-900 shadow-2xs rounded-2xs">
                    {item.kategori}
                  </span>

                  {item.is_grosir ? (
                    <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-amber-900 text-amber-100 border border-amber-700/40 px-2 py-0.5 shadow-sm flex items-center gap-1 rounded-2xs">
                      <Tag className="w-2.5 h-2.5 text-amber-300" />
                      <span>SERI ({item.min_grosir || 5} PCS)</span>
                    </span>
                  ) : (
                    <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-neutral-950 text-white px-2 py-0.5 shadow-sm rounded-2xs">
                      ECERAN
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
                    {item.ukuran.join(", ")} •{" "}
                    {item.is_grosir
                      ? "Seri Campur Warna"
                      : `${item.warna.length} Warna`}{" "}
                    {item.berat ? `• ${item.berat} gr` : ""}
                  </p>

                  <div className="pt-0.5">
                    <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">
                      {item.is_grosir ? "Harga Seri: " : "Harga Satuan: "}
                      <strong className="text-neutral-950 font-bold font-mono">
                        Rp {item.harga.toLocaleString("id-ID")}
                        <span className="text-[9px] font-normal text-stone-500">
                          {" "}
                          /pcs
                        </span>
                      </strong>
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border rounded-2xs ${
                        item.stok > 0
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      Total Stok: {item.stok} pcs
                    </span>
                  </div>
                </div>

                <div className="p-2 sm:p-3 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-950 text-white hover:bg-amber-950 text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                    title="Edit Produk"
                  >
                    <Pencil className="w-3 h-3 text-amber-300" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-bold uppercase transition shadow-2xs cursor-pointer rounded-2xs"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Hapus</span>
                  </button>
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
            onClick={() => !isSubmitting && setShowAddModal(false)}
          />
          <div className="relative z-10 bg-white border border-stone-200 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col rounded-xs">
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
                      <Loader2 className="w-3 h-3 animate-spin" /> Memproses
                      Foto HD...
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
                    *Warna otomatis tercatat sebagai "Seri Mix (Campur Warna)"
                    dan pembeli langsung membeli kelipatan{" "}
                    {formProduk.min_grosir} pcs.
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
                        Input Stok Satuan ({formProduk.ukuranTeks || "All Size"}
                        )
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
                                      handleStokWarnaChange(
                                        warna,
                                        e.target.value,
                                      )
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
                      <span>
                        {isEditMode ? "Simpan Perubahan" : "Terbitkan"}
                      </span>
                    </>
                  )}
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
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {deleteTarget.nama}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Rp {deleteTarget.harga.toLocaleString("id-ID")} • Total Stok:{" "}
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
