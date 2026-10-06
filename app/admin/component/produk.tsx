"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../penyimpanan/supabase";

// Import Sub-Komponen dari folder produk-component/
import ProdukHeaderFilter from "./produk-component/ProdukHeaderFilter";
import ProdukGridList from "./produk-component/ProdukGridList";
import ModalFormProduk from "./produk-component/ModalFormProduk";
import ModalDeleteKategori from "./produk-component/ModalDeleteKategori";
import ModalDeleteProduk from "./produk-component/ModalDeleteProduk";
import ModalValidation from "./produk-component/ModalValidation";

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

const BUCKET_NAME = "products";
const uploadBase64ToSupabase = async (
  base64: string,
  folder: string = "produk",
  prefix: string = "img",
): Promise<string> => {
  // 1. Kalau sudah URL (bukan base64), langsung kembalikan
  if (!base64 || !base64.startsWith("data:")) {
    return base64;
  }

  // 2. Parse base64
  const match = base64.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Format base64 tidak valid");
  }

  const mimeType = match[1];              // e.g. image/webp
  const base64Data = match[2];
  const ext = mimeType.split("/")[1].replace("+xml", ""); // webp, jpeg, png

  // 3. Convert base64 → Uint8Array (browser-friendly)
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 4. Nama file unik
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const filePath = `${folder}/${prefix}-${randomId}.${ext}`;

  // 5. Upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "31536000", // 1 tahun
    });

  if (uploadError) throw uploadError;

  // 6. Ambil public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
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

    let gambarUrl: string | null = null;

    try {
      gambarUrl = await uploadBase64ToSupabase(
        finalList[0],
        "produk",
        "utama",
      );
    } catch (err) {
      console.error("Gagal upload gambar_utama:", err);
      // Kalau gagal upload, biarkan null (atau bisa set ke fallbackImg)
      gambarUrl = null;
    }

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
      gambar_url: gambarUrl || null,
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

      {/* TOAST NOTIFIKASI BERHASIL */}
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

      {/* HEADER & TAB FILTER */}
      <ProdukHeaderFilter
        produk={produk}
        filterTipe={filterTipe}
        setFilterTipe={setFilterTipe}
        resetForm={resetForm}
        setShowAddModal={setShowAddModal}
      />

      {/* DAFTAR GRID PRODUK */}
      <ProdukGridList
        isLoading={isLoading}
        displayedProducts={displayedProducts}
        filterTipe={filterTipe}
        handleOpenEdit={handleOpenEdit}
        setDeleteTarget={setDeleteTarget}
        resetForm={resetForm}
        setShowAddModal={setShowAddModal}
      />

      {/* MODAL FORM PRODUK */}
      <ModalFormProduk
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        isCompressing={isCompressing}
        formProduk={formProduk}
        setFormProduk={setFormProduk}
        handleAddSubmit={handleAddSubmit}
        handleMultipleImageUpload={handleMultipleImageUpload}
        handleRemoveSingleImage={handleRemoveSingleImage}
        handleSetPrimaryImage={handleSetPrimaryImage}
        handleHargaChange={handleHargaChange}
        handleStokWarnaChange={handleStokWarnaChange}
        handleAddCustomColor={handleAddCustomColor}
        handleRemoveColor={handleRemoveColor}
        inputWarnaBaru={inputWarnaBaru}
        setInputWarnaBaru={setInputWarnaBaru}
        kategoriList={kategoriList}
        newKategoriInput={newKategoriInput}
        setNewKategoriInput={setNewKategoriInput}
        showAddKategoriInput={showAddKategoriInput}
        setShowAddKategoriInput={setShowAddKategoriInput}
        handleAddKategori={handleAddKategori}
        setDeleteKategoriTarget={setDeleteKategoriTarget}
        ukuranList={ukuranList}
        newUkuranInput={newUkuranInput}
        setNewUkuranInput={setNewUkuranInput}
        showAddUkuranInput={showAddUkuranInput}
        setShowAddUkuranInput={setShowAddUkuranInput}
        handleAddUkuran={handleAddUkuran}
        activeWarnaList={activeWarnaList}
        totalStokTerhitung={totalStokTerhitung}
      />

      {/* MODAL HAPUS KATEGORI */}
      <ModalDeleteKategori
        deleteKategoriTarget={deleteKategoriTarget}
        setDeleteKategoriTarget={setDeleteKategoriTarget}
        confirmDeleteKategori={confirmDeleteKategori}
      />

      {/* MODAL HAPUS PRODUK */}
      <ModalDeleteProduk
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        confirmDelete={confirmDelete}
      />

      {/* MODAL VALIDASI FORM */}
      <ModalValidation
        validationModal={validationModal}
        setValidationModal={setValidationModal}
      />
    </div>
  );
}
