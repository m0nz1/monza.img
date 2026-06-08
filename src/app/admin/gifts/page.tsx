"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Save,
  Package,
} from "lucide-react";
import type { Gift } from "@/types";
import { formatDateShort } from "@/lib/utils";

const DEFAULT_FORM = {
  name: "",
  image: "",
  description: "",
  stock: 10,
};

type GiftForm = typeof DEFAULT_FORM;

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filtered, setFiltered] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editGift, setEditGift] = useState<Gift | null>(null);
  const [form, setForm] = useState<GiftForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: false });
    setGifts(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  const applySearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setFiltered(gifts);
      } else {
        setFiltered(
          gifts.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
        );
      }
      setPage(1);
    },
    [gifts]
  );

  useEffect(() => {
    applySearch(search);
  }, [search, applySearch]);

  const openAdd = () => {
    setEditGift(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEdit = (gift: Gift) => {
    setEditGift(gift);
    setForm({
      name: gift.name,
      image: gift.image,
      description: gift.description,
      stock: gift.stock,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Nama dan deskripsi wajib diisi!");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    try {
      if (editGift) {
        const { error } = await supabase
          .from("gifts")
          .update(form)
          .eq("id", editGift.id);
        if (error) throw error;
        toast.success("Hadiah berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("gifts").insert(form);
        if (error) throw error;
        toast.success("Hadiah berhasil ditambahkan!");
      }
      setShowModal(false);
      loadGifts();
    } catch {
      toast.error("Terjadi kesalahan!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hadiah ini?")) return;
    setDeletingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("gifts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Hadiah dihapus!");
      loadGifts();
    } catch {
      toast.error("Gagal menghapus hadiah!");
    } finally {
      setDeletingId(null);
    }
  };

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-brand-black dark:text-white">
            LIST HADIAH
          </h2>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {gifts.length} total hadiah
          </p>
        </div>
        <button onClick={openAdd} className="btn-brutal px-4 py-2.5 flex items-center gap-2 text-sm">
          <Plus size={16} />
          TAMBAH HADIAH
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari hadiah..."
          className="input-brutal pl-10 py-2.5"
        />
      </div>

      {/* Table */}
      <div className="card-brutal bg-white dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="font-mono text-sm text-zinc-400">Tidak ada hadiah</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-3 border-brand-black dark:border-white bg-zinc-50 dark:bg-zinc-800">
                  {["Nama Hadiah", "Deskripsi", "Stok", "Dibuat", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-mono text-xs font-bold text-brand-black dark:text-white uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((gift) => (
                  <tr
                    key={gift.id}
                    className="border-b-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-brand-black dark:text-white">
                        {gift.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {gift.description}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge-brutal text-xs px-2 py-0.5 ${
                          gift.stock === 0
                            ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                            : "bg-brand-lime text-brand-black"
                        }`}
                      >
                        {gift.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                      {formatDateShort(gift.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(gift)}
                          className="w-8 h-8 border-2 border-brand-black dark:border-white bg-brand-blue text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(gift.id)}
                          disabled={deletingId === gift.id}
                          className="w-8 h-8 border-2 border-brand-black dark:border-white bg-brand-red text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {deletingId === gift.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
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
        <div className="flex items-center gap-2 mt-4 justify-center">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-brand-black/70"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-md border-3 border-brand-black bg-white dark:bg-zinc-900 shadow-brutal-xl animate-slide-up">
            {/* Modal Header */}
            <div className="border-b-3 border-brand-black dark:border-white bg-brand-yellow p-4 flex items-center justify-between">
              <span className="font-display text-xl text-brand-black">
                {editGift ? "EDIT HADIAH" : "TAMBAH HADIAH"}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 border-2 border-brand-black bg-white flex items-center justify-center"
              >
                <X size={14} className="text-brand-black" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {[
                { key: "name", label: "Nama Hadiah", type: "text", placeholder: "Diamond 100" },
                { key: "image", label: "URL Gambar (Opsional)", type: "text", placeholder: "https://..." },
                { key: "description", label: "Deskripsi", type: "text", placeholder: "Deskripsi hadiah..." },
                { key: "stock", label: "Jumlah Stok", type: "number", placeholder: "10" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block font-mono text-xs font-bold text-brand-black dark:text-white mb-1.5 uppercase tracking-widest">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof GiftForm]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          type === "number"
                            ? parseInt(e.target.value) || 0
                            : e.target.value,
                      })
                    }
                    placeholder={placeholder}
                    className="input-brutal py-2.5"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-3 border-brand-black dark:border-white bg-zinc-100 dark:bg-zinc-800 text-brand-black dark:text-white py-3 font-mono text-sm font-bold hover:bg-zinc-200 transition-colors"
                >
                  BATAL
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-brutal py-3 text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "MENYIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
