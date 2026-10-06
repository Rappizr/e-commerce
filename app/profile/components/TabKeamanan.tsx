"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface TabKeamananProps {
  onChangePassword: (
    e: React.FormEvent,
    newPass: string,
    confirmPass: string,
  ) => Promise<void>;
  isSaving: boolean;
}

export default function TabKeamanan({
  onChangePassword,
  isSaving,
}: TabKeamananProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      await onChangePassword(e, newPassword, confirmPassword);
      setPasswordSuccess("Kata sandi berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.message || "Gagal mengubah kata sandi.";
      setPasswordError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5 max-w-xl">
      <div className="space-y-0.5">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
          Perbarui Kata Sandi
        </h3>
        <p className="text-[11px] sm:text-xs text-neutral-500">
          Ganti kata sandi akun pelanggan Anda secara aman.
        </p>
      </div>

      {/* Error / Success message di atas form */}
      {passwordError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xs">
          {passwordError}
        </div>
      )}
      {passwordSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-2xs">
          {passwordSuccess}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
            Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              required
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError("");
                if (passwordSuccess) setPasswordSuccess("");
              }}
              className="w-full bg-neutral-50 border border-neutral-300 pl-3.5 pr-10 py-2 sm:py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white font-mono rounded-2xs"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError("");
              if (passwordSuccess) setPasswordSuccess("");
            }}
            className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 sm:py-2.5 text-xs focus:outline-none focus:border-neutral-950 focus:bg-white font-mono rounded-2xs"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full sm:w-auto bg-neutral-950 hover:bg-black disabled:bg-neutral-400 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-6 py-3 transition cursor-pointer flex items-center justify-center gap-2 rounded-2xs"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isSaving ? "Menyimpan..." : "Ganti Kata Sandi"}</span>
      </button>
    </form>
  );
}
