"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Flame, Mail, User, ArrowRight, Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; username?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; username?: string } = {};
    if (!email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!username) {
      newErrors.username = "Username wajib diisi";
    } else if (username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    } else if (username.length > 20) {
      newErrors.username = "Username maksimal 20 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username hanya boleh huruf, angka, dan underscore";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Upsert user data
      const { error } = await supabase.from("users").upsert(
        {
          email: email.toLowerCase().trim(),
          username: username.trim(),
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      // Store user info in localStorage
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (userData) {
        localStorage.setItem("ff_user", JSON.stringify(userData));
      }

      toast.success("Berhasil masuk! Selamat datang 🔥");
      router.push("/gifts");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan. Coba lagi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Logo Card */}
      <div className="card-brutal bg-brand-orange p-6 mb-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 bg-brand-yellow border-3 border-brand-black shadow-brutal flex items-center justify-center">
            <Flame size={40} className="text-brand-black" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display text-4xl text-white tracking-tight">
          FF GIVEAWAY
        </h1>
        <p className="font-body text-white/90 mt-1 font-semibold">
          🎁 Hadiah Free Fire Gratis!
        </p>
      </div>

      {/* Login Form Card */}
      <div className="card-brutal bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-display text-2xl text-brand-black dark:text-white mb-1">
          MASUK SEKARANG
        </h2>
        <p className="font-body text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Daftar & ikuti giveaway untuk menang hadiah!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-mono text-xs font-bold text-brand-black dark:text-white mb-2 uppercase tracking-widest">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="kamu@email.com"
                className={`input-brutal pl-10 ${
                  errors.email ? "border-brand-red shadow-none" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs font-bold text-brand-red font-mono">
                ⚠ {errors.email}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block font-mono text-xs font-bold text-brand-black dark:text-white mb-2 uppercase tracking-widest">
              Username
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username)
                    setErrors({ ...errors, username: undefined });
                }}
                placeholder="username_kamu"
                className={`input-brutal pl-10 ${
                  errors.username ? "border-brand-red shadow-none" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs font-bold text-brand-red font-mono">
                ⚠ {errors.username}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-brutal w-full py-4 text-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>MASUK & IKUTI GIVEAWAY</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t-3 border-brand-black dark:border-zinc-700">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono text-center">
            Dengan masuk, kamu setuju mengikuti rules giveaway.
          </p>
        </div>
      </div>

      {/* Decorative tags */}
      <div className="flex gap-2 mt-4 justify-center flex-wrap">
        {["#FreeFire", "#Giveaway", "#Diamond", "#ElitePass"].map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
