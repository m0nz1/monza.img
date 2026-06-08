"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { GiftCard } from "./GiftCard";
import { GiftCardSkeleton } from "./GiftCardSkeleton";
import { SuccessModal } from "./SuccessModal";
import type { Gift, User } from "@/types";
import toast from "react-hot-toast";
import { Search, Filter, RefreshCw } from "lucide-react";

export default function GiftsList() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filtered, setFiltered] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "empty">("all");
  const [participating, setParticipating] = useState<string | null>(null);
  const [joinedGifts, setJoinedGifts] = useState<Set<string>>(new Set());
  const [successGift, setSuccessGift] = useState<Gift | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ff_user");
    if (stored) setUser(JSON.parse(stored));
    loadGifts();
    loadJoinedGifts();
  }, []);

  const loadGifts = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gifts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setGifts(data || []);
      setFiltered(data || []);
    } catch {
      toast.error("Gagal memuat hadiah");
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedGifts = async () => {
    const stored = localStorage.getItem("ff_user");
    if (!stored) return;
    const u: User = JSON.parse(stored);
    const supabase = createClient();
    const { data } = await supabase
      .from("participants")
      .select("gift_id")
      .eq("user_id", u.id);
    if (data) setJoinedGifts(new Set(data.map((d) => d.gift_id)));
  };

  const applyFilter = useCallback(
    (q: string, f: typeof filter) => {
      let result = gifts;
      if (q.trim()) {
        result = result.filter((g) =>
          g.name.toLowerCase().includes(q.toLowerCase())
        );
      }
      if (f === "available") result = result.filter((g) => g.stock > 0);
      if (f === "empty") result = result.filter((g) => g.stock === 0);
      setFiltered(result);
    },
    [gifts]
  );

  useEffect(() => {
    applyFilter(search, filter);
  }, [search, filter, applyFilter]);

  const handleJoin = async (gift: Gift) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      return;
    }
    if (joinedGifts.has(gift.id)) {
      toast.error("Kamu sudah mendaftar untuk hadiah ini!");
      return;
    }
    if (gift.stock === 0) {
      toast.error("Stok hadiah sudah habis!");
      return;
    }

    setParticipating(gift.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("participants")
        .insert({ user_id: user.id, gift_id: gift.id });
      if (error) {
        if (error.code === "23505") {
          toast.error("Kamu sudah mendaftar untuk hadiah ini!");
          setJoinedGifts((prev) => new Set([...prev, gift.id]));
          return;
        }
        throw error;
      }
      // Decrement stock
      await supabase
        .from("gifts")
        .update({ stock: gift.stock - 1 })
        .eq("id", gift.id);

      setJoinedGifts((prev) => new Set([...prev, gift.id]));
      setGifts((prev) =>
        prev.map((g) => (g.id === gift.id ? { ...g, stock: g.stock - 1 } : g))
      );
      setSuccessGift(gift);
    } catch {
      toast.error("Gagal mendaftar. Coba lagi!");
    } finally {
      setParticipating(null);
    }
  };

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Cari hadiah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-brutal pl-10 py-2.5"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter
            size={16}
            className="text-zinc-500 dark:text-zinc-400 shrink-0"
          />
          {(["all", "available", "empty"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border-3 border-brand-black dark:border-white px-3 py-2 font-mono text-xs font-bold transition-all
                ${
                  filter === f
                    ? "bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-none translate-x-[2px] translate-y-[2px]"
                    : "bg-white dark:bg-zinc-900 text-brand-black dark:text-white shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
            >
              {f === "all" ? "SEMUA" : f === "available" ? "TERSEDIA" : "HABIS"}
            </button>
          ))}
          <button
            onClick={loadGifts}
            className="w-10 h-10 border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center transition-all"
          >
            <RefreshCw
              size={14}
              className={`text-brand-black dark:text-white ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Menampilkan {filtered.length} dari {gifts.length} hadiah
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <GiftCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-brutal bg-zinc-50 dark:bg-zinc-900 p-12 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="font-display text-2xl text-brand-black dark:text-white mb-2">
            TIDAK ADA HADIAH
          </h3>
          <p className="font-body text-zinc-500 dark:text-zinc-400">
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              hasJoined={joinedGifts.has(gift.id)}
              isLoading={participating === gift.id}
              onJoin={() => handleJoin(gift)}
            />
          ))}
        </div>
      )}

      {/* Success Modal */}
      {successGift && (
        <SuccessModal
          gift={successGift}
          onClose={() => setSuccessGift(null)}
        />
      )}
    </div>
  );
}
