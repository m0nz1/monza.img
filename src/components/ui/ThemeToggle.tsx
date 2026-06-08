"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 border-3 border-brand-black dark:border-white bg-white dark:bg-zinc-900 
                 shadow-brutal dark:shadow-brutal-white flex items-center justify-center
                 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]
                 transition-all duration-150"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun size={18} className="text-brand-yellow" />
      ) : (
        <Moon size={18} className="text-brand-black" />
      )}
    </button>
  );
}
