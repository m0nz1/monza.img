"use client";

import { Loader2, CheckCircle, Zap, Package } from "lucide-react";
import type { Gift } from "@/types";
import Image from "next/image";

interface GiftCardProps {
  gift: Gift;
  hasJoined: boolean;
  isLoading: boolean;
  onJoin: () => void;
}

// Emoji maps for gift names
const GIFT_EMOJIS: Record<string, string> = {
  "Diamond 100": "💎",
  "Diamond 310": "💎",
  "Diamond 520": "💎",
  "Diamond 1060": "💎",
  "Elite Pass": "👑",
  "Bundle Evo Gun": "🔫",
  "Bundle Cobra": "🐍",
  "Bundle Hip Hop": "🎤",
  "Emote Premium": "🕺",
  "Voucher Free Fire": "🎫",
};

const GIFT_COLORS: Record<string, string> = {
  "Diamond 100": "bg-blue-400",
  "Diamond 310": "bg-blue-500",
  "Diamond 520": "bg-blue-600",
  "Diamond 1060": "bg-purple-600",
  "Elite Pass": "bg-brand-yellow",
  "Bundle Evo Gun": "bg-brand-orange",
  "Bundle Cobra": "bg-green-600",
  "Bundle Hip Hop": "bg-pink-500",
  "Emote Premium": "bg-brand-lime",
  "Voucher Free Fire": "bg-red-500",
};

export function GiftCard({ gift, hasJoined, isLoading, onJoin }: GiftCardProps) {
  const emoji = GIFT_EMOJIS[gift.name] || "🎁";
  const colorClass = GIFT_COLORS[gift.name] || "bg-zinc-400";
  const isOutOfStock = gift.stock === 0;

  return (
    <div
      className={`border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 shadow-brutal-lg 
                  transition-all duration-150 flex flex-col animate-fade-in
                  ${!isOutOfStock && !hasJoined ? "hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]" : ""}`}
    >
      {/* Image / Emoji */}
      <div
        className={`${colorClass} border-b-3 border-brand-black dark:border-white h-40 flex items-center justify-center relative`}
      >
        {gift.image && gift.image.startsWith("http") ? (
          <Image
            src={gift.image}
            alt={gift.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-6xl">{emoji}</span>
        )}
        {/* Stock badge */}
        <div
          className={`absolute top-2 right-2 border-2 border-brand-black px-2 py-0.5 font-mono text-xs font-bold
          ${isOutOfStock ? "bg-zinc-400 text-white" : "bg-brand-lime text-brand-black"}`}
        >
          {isOutOfStock ? "HABIS" : `${gift.stock} sisa`}
        </div>
        {hasJoined && (
          <div className="absolute top-2 left-2 bg-brand-blue border-2 border-brand-black px-2 py-0.5 font-mono text-xs font-bold text-white">
            ✓ JOINED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg text-brand-black dark:text-white leading-tight mb-1">
          {gift.name}
        </h3>
        <p className="font-body text-zinc-500 dark:text-zinc-400 text-sm flex-1 mb-3 line-clamp-2">
          {gift.description}
        </p>

        {/* Stock bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Package size={12} />
              Stok
            </span>
            <span className="font-mono text-xs font-bold text-brand-black dark:text-white">
              {gift.stock}
            </span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 border-2 border-brand-black dark:border-white">
            <div
              className={`h-full transition-all ${isOutOfStock ? "bg-zinc-400" : "bg-brand-lime border-r-2 border-brand-black"}`}
              style={{
                width: `${Math.min(100, (gift.stock / 100) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={onJoin}
          disabled={isLoading || hasJoined || isOutOfStock}
          className={`w-full py-3 font-display text-sm flex items-center justify-center gap-2
            border-3 border-brand-black dark:border-white transition-all duration-150
            ${
              hasJoined
                ? "bg-brand-blue text-white shadow-none cursor-default"
                : isOutOfStock
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed shadow-none"
                  : isLoading
                    ? "bg-brand-yellow text-brand-black shadow-none"
                    : "bg-brand-yellow text-brand-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              MENDAFTAR...
            </>
          ) : hasJoined ? (
            <>
              <CheckCircle size={16} />
              SUDAH IKUT
            </>
          ) : isOutOfStock ? (
            "STOK HABIS"
          ) : (
            <>
              <Zap size={16} />
              IKUTI GIVEAWAY
            </>
          )}
        </button>
      </div>
    </div>
  );
}
