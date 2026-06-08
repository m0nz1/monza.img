"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("ff_user");
    router.push("/login");
  };

  return (
    <header className="border-b-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="font-display text-lg text-brand-black dark:text-white leading-tight">
          ADMIN DASHBOARD
        </h1>
        <p className="font-mono text-xs text-zinc-400 hidden sm:block">
          FF Giveaway Management
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/gifts"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 border-3 border-brand-black dark:border-white bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 font-mono text-xs font-bold text-brand-black dark:text-white shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <ExternalLink size={12} />
          VIEW SITE
        </Link>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 border-3 border-brand-black dark:border-white bg-brand-red text-white px-3 py-1.5 font-mono text-xs font-bold shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">KELUAR</span>
        </button>
      </div>
    </header>
  );
}
