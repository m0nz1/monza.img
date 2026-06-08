"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Trophy, RefreshCw } from "lucide-react";

interface ParticipantRow {
  id: string;
  created_at: string;
  username: string;
  email: string;
  gift_name: string;
}

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [filtered, setFiltered] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("participants")
      .select(`id, created_at, users(username, email), gifts(name)`)
      .order("created_at", { ascending: false });

    type RawParticipant = {
      id: string;
      created_at: string;
      users: { username: string; email: string } | null;
      gifts: { name: string } | null;
    };
    const rows: ParticipantRow[] = ((data || []) as RawParticipant[]).map((d) => ({
      id: d.id,
      created_at: d.created_at,
      username: d.users?.username || "-",
      email: d.users?.email || "-",
      gift_name: d.gifts?.name || "-",
    }));
    setParticipants(rows);
    setFiltered(rows);
    setLoading(false);
  };

  const applySearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setFiltered(participants);
      } else {
        const lower = q.toLowerCase();
        setFiltered(
          participants.filter(
            (p) =>
              p.username.toLowerCase().includes(lower) ||
              p.email.toLowerCase().includes(lower) ||
              p.gift_name.toLowerCase().includes(lower)
          )
        );
      }
      setPage(1);
    },
    [participants]
  );

  useEffect(() => {
    applySearch(search);
  }, [search, applySearch]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-brand-black dark:text-white">
            LIST PESERTA
          </h2>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {participants.length} total peserta giveaway
          </p>
        </div>
        <button
          onClick={loadParticipants}
          className="w-10 h-10 border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center transition-all self-end sm:self-auto"
        >
          <RefreshCw
            size={14}
            className={`text-brand-black dark:text-white ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari username, email, atau hadiah..."
          className="input-brutal pl-10 py-2.5"
        />
      </div>

      {/* Table */}
      <div className="card-brutal bg-white dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="font-mono text-sm text-zinc-400">
              Tidak ada peserta
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-3 border-brand-black dark:border-white bg-zinc-50 dark:bg-zinc-800">
                  {["#", "Username", "Email", "Hadiah Dipilih", "Tanggal Join"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-mono text-xs font-bold text-brand-black dark:text-white uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                      {(page - 1) * PER_PAGE + i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-blue border-2 border-brand-black flex items-center justify-center">
                          <span className="font-display text-xs text-white">
                            {p.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-brand-black dark:text-white">
                          @{p.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-zinc-500 dark:text-zinc-400">
                      {p.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-brutal bg-brand-yellow text-brand-black text-xs px-2 py-0.5">
                        {p.gift_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                      {new Date(p.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 border-3 font-mono text-sm font-bold transition-all
                ${
                  p === page
                    ? "border-brand-black dark:border-white bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-none translate-x-[2px] translate-y-[2px]"
                    : "border-brand-black dark:border-white bg-white dark:bg-zinc-900 text-brand-black dark:text-white shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  }
      
