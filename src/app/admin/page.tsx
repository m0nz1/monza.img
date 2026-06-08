"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Gift, Trophy, TrendingUp, RefreshCw } from "lucide-react";
import type { DashboardStats } from "@/types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="card-brutal bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 ${color} border-3 border-brand-black dark:border-white shadow-brutal flex items-center justify-center`}
        >
          <Icon size={22} className="text-brand-black" />
        </div>
        <TrendingUp size={16} className="text-brand-lime" />
      </div>
      {loading ? (
        <div className="skeleton h-9 w-24 mb-1" />
      ) : (
        <p className="font-display text-4xl text-brand-black dark:text-white">
          {value.toLocaleString("id-ID")}
        </p>
      )}
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGifts: 0,
    totalParticipants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      username: string;
      email: string;
      gift_name: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const [
        { count: users },
        { count: gifts },
        { count: participants },
        { data: activity },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("gifts").select("*", { count: "exact", head: true }),
        supabase
          .from("participants")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("participants")
          .select(
            `created_at, users(username, email), gifts(name)`
          )
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalUsers: users || 0,
        totalGifts: gifts || 0,
        totalParticipants: participants || 0,
      });

      if (activity) {
        setRecentActivity(
          (activity as Array<{
            created_at: string;
            users: { username: string; email: string } | null;
            gifts: { name: string } | null;
          }>).map((a) => ({
            username: a.users?.username || "-",
            email: a.users?.email || "-",
            gift_name: a.gifts?.name || "-",
            created_at: a.created_at,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-brand-black dark:text-white">
            OVERVIEW
          </h2>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Statistik real-time giveaway
          </p>
        </div>
        <button
          onClick={loadStats}
          className="w-10 h-10 border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center transition-all"
        >
          <RefreshCw
            size={14}
            className={`text-brand-black dark:text-white ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total User"
          value={stats.totalUsers}
          icon={Users}
          color="bg-brand-blue"
          loading={loading}
        />
        <StatCard
          label="Total Hadiah"
          value={stats.totalGifts}
          icon={Gift}
          color="bg-brand-yellow"
          loading={loading}
        />
        <StatCard
          label="Total Peserta"
          value={stats.totalParticipants}
          icon={Trophy}
          color="bg-brand-lime"
          loading={loading}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-display text-lg text-brand-black dark:text-white mb-3">
          AKTIVITAS TERBARU
        </h3>
        <div className="card-brutal bg-white dark:bg-zinc-900 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-10 text-center">
              <Trophy size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="font-mono text-sm text-zinc-400">
                Belum ada aktivitas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-3 border-brand-black dark:border-white bg-zinc-50 dark:bg-zinc-800">
                    {["Username", "Email", "Hadiah", "Waktu"].map((h) => (
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
                  {recentActivity.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-bold text-brand-black dark:text-white">
                        @{item.username}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-zinc-500 dark:text-zinc-400">
                        {item.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-brutal bg-brand-yellow text-brand-black text-xs px-2 py-0.5">
                          {item.gift_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
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
      </div>
    </div>
  );
}
