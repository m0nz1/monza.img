"use client";

import { useEffect } from "react";
import { CheckCircle, X, Share2, Flame } from "lucide-react";
import type { Gift } from "@/types";

interface SuccessModalProps {
  gift: Gift;
  onClose: () => void;
}

export function SuccessModal({ gift, onClose }: SuccessModalProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm border-3 border-brand-black bg-white dark:bg-zinc-900 shadow-brutal-xl animate-slide-up">
        {/* Header */}
        <div className="bg-brand-lime border-b-3 border-brand-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-brand-black" />
            <span className="font-display text-xl text-brand-black">
              BERHASIL!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-brand-black bg-white flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors"
          >
            <X size={14} className="text-brand-black" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-brand-yellow border-3 border-brand-black shadow-brutal mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={36} className="text-brand-black" />
          </div>

          <h3 className="font-display text-2xl text-brand-black dark:text-white mb-1">
            KAMU TERDAFTAR!
          </h3>
          <p className="font-body text-zinc-600 dark:text-zinc-400 text-sm mb-4">
            Kamu berhasil mendaftar untuk hadiah:
          </p>

          <div className="border-3 border-brand-black bg-brand-orange p-3 mb-5">
            <p className="font-display text-xl text-white">{gift.name}</p>
            <p className="font-mono text-xs text-white/80 mt-0.5">
              {gift.description}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 p-3 mb-5">
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              📢 Pemenang akan diumumkan melalui email yang kamu daftarkan.
              Pantau terus social media kami!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-brutal py-3 text-sm"
            >
              LANJUT PILIH
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "FF Giveaway",
                    text: `Aku baru ikutan giveaway ${gift.name} di FF Giveaway! Yuk ikutan juga!`,
                    url: window.location.href,
                  });
                }
              }}
              className="w-12 h-full border-3 border-brand-black dark:border-white bg-brand-blue text-white shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
