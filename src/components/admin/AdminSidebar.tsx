"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  Users,
  Trophy,
  Flame,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/gifts",
    label: "List Hadiah",
    icon: Gift,
  },
  {
    href: "/admin/users",
    label: "List User",
    icon: Users,
  },
  {
    href: "/admin/participants",
    label: "List Peserta",
    icon: Trophy,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r-3 border-brand-black dark:border-white bg-brand-black sticky top-0 h-screen">
        {/* Logo */}
        <div className="border-b-3 border-white/20 p-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-yellow border-2 border-white flex items-center justify-center">
              <Flame size={16} className="text-brand-black" />
            </div>
            <div>
              <p className="font-display text-brand-yellow text-sm leading-tight">
                FF GIVEAWAY
              </p>
              <p className="font-mono text-white/50 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 font-mono text-sm font-bold transition-all
                  ${
                    active
                      ? "bg-brand-yellow text-brand-black border-2 border-brand-yellow"
                      : "text-zinc-400 hover:text-white hover:bg-white/10 border-2 border-transparent"
                  }`}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-3 border-white/20 p-4">
          <p className="font-mono text-xs text-white/30 text-center">
            FF Giveaway v1.0
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t-3 border-brand-black dark:border-white bg-brand-black flex">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-mono font-bold transition-colors
                ${active ? "text-brand-yellow" : "text-zinc-500"}`}
            >
              <Icon size={18} />
              <span className="text-[10px] leading-tight">{label.split(" ")[label.split(" ").length - 1]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
