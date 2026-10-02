"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ProfileToastProps {
  show: boolean;
  message: string;
  type: "success" | "danger" | "info";
}

export default function ProfileToast({
  show,
  message,
  type,
}: ProfileToastProps) {
  if (!show) return null;

  return (
    <div className="fixed top-20 sm:top-24 right-4 sm:right-8 lg:right-16 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw] sm:max-w-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-neutral-950/95 backdrop-blur-md text-white border shadow-xl rounded-lg transition-all ${
          type === "danger"
            ? "border-rose-500/40 text-rose-50"
            : type === "info"
              ? "border-amber-500/40 text-amber-50"
              : "border-emerald-500/40 text-emerald-50"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            type === "danger"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : type === "info"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {type === "danger" ? (
            <AlertCircle className="w-4 h-4" />
          ) : type === "info" ? (
            <Info className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-snug">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
