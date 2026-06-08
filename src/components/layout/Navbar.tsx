"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Flame, LogOut, Menu, X, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { User } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ff_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ff_user");
    router.push("/login");
  };

  const isAdmin =
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user?.email === "admin@ffgiveaway.com";

  return (
    <nav className="sticky top-0 z-50 border-b-3 border-brand-black dark:border-white bg-brand-yellow dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/gifts"
          className="flex items-center gap-2 group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-9 h-9 bg-brand-black dark:bg-white border-3 border-brand-black dark:border-white flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Flame
              size={18}
              className="text-brand-yellow dark:text-brand-black"
            />
          </div>
          <span className="font-display text-xl text-brand-black dark:text-white tracking-tight hidden sm:block">
            FF GIVEAWAY
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className="border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-800 px-3 py-1.5 shadow-brutal dark:shadow-brutal-white">
              <span className="font-mono text-xs font-bold text-brand-black dark:text-white">
                @{user.username}
              </span>
            </div>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 border-3 border-brand-black dark:border-white px-3 py-1.5 font-mono text-xs font-bold shadow-brutal dark:shadow-brutal-white hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-brand-black dark:bg-white text-brand-yellow dark:text-brand-black"
                  : "bg-white dark:bg-zinc-800 text-brand-black dark:text-white"
              }`}
            >
              <Shield size={14} />
              ADMIN
            </Link>
          )}
          <ThemeToggle />
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border-3 border-brand-black dark:border-white bg-brand-red text-white px-3 py-1.5 font-mono text-xs font-bold shadow-brutal dark:shadow-brutal-white hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <LogOut size={14} />
              KELUAR
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-center shadow-brutal"
          >
            {menuOpen ? (
              <X size={18} className="text-brand-black dark:text-white" />
            ) : (
              <Menu size={18} className="text-brand-black dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t-3 border-brand-black dark:border-white bg-brand-yellow dark:bg-zinc-900 px-4 py-4 space-y-3 animate-slide-up">
          {user && (
            <div className="border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-800 px-3 py-2">
              <span className="font-mono text-xs font-bold text-brand-black dark:text-white">
                Masuk sebagai @{user.username}
              </span>
            </div>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 border-3 border-brand-black dark:border-white bg-brand-black text-brand-yellow px-3 py-2 font-mono text-sm font-bold w-full"
            >
              <Shield size={16} />
              Admin Dashboard
            </Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border-3 border-brand-black dark:border-white bg-brand-red text-white px-3 py-2 font-mono text-sm font-bold w-full"
            >
              <LogOut size={16} />
              Keluar
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
