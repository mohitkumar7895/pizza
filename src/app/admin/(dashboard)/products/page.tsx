"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, Search, X } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  uploadImage,
} from "@/services/products";
import { fetchCategories } from "@/services/categories";
import type { CategoryDTO, ProductDTO } from "@/types";

type VariantRow = { label: string; price: string };

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  isVeg: true,
  variants: [] as VariantRow[],
};

export default function AdminProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
    } catch {
      setMsg("Failed to load. Sign in at /admin/login if your session expired.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const normalizedVariants = form.variants
      .map((v) => ({
        label: v.label.trim(),
        price: Number(v.price),
      }))
      .filter(
        (v) =>
          v.label.length > 0 &&
          Number.isFinite(v.price) &&
          !Number.isNaN(v.price) &&
          v.price >= 0
      );

    const basePrice = Number(form.price);
    const price =
      normalizedVariants.length > 0
        ? Math.min(...normalizedVariants.map((v) => v.price))
        : basePrice;

    if (!form.name.trim() || !form.category.trim()) {
      setMsg("Name and category are required.");
      return;
    }
    if (normalizedVariants.length === 0 && (!Number.isFinite(basePrice) || basePrice < 0)) {
      setMsg("Price is required, or add at least one size/type below.");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category.trim(),
        image: form.image.trim(),
        isVeg: form.isVeg,
        variants: normalizedVariants,
      };
      if (editingId) {
        await updateProduct(editingId, payload);
        setMsg("Product updated.");
      } else {
        await createProduct(payload);
        setMsg("Product created.");
      }
      reset();
      load();
    } catch {
      setMsg("Save failed. Check MongoDB or sign in again.");
    }
  };

  const startEdit = (p: ProductDTO) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image: p.image,
      isVeg: p.isVeg,
      variants:
        p.variants && p.variants.length > 0
          ? p.variants.map((v) => ({
              label: v.label,
              price: String(v.price),
            }))
          : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch {
      setMsg("Delete failed.");
    }
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImage(f);
      setForm((s) => ({ ...s, image: url }));
      setMsg(null);
    } catch {
      setMsg("Image upload failed — try again (you must be logged in).");
    } finally {
      setUploading(false);
    }
  };

  const addVariantRow = () => {
    setForm((s) => ({
      ...s,
      variants: [...s.variants, { label: "", price: "" }],
    }));
  };

  const removeVariantRow = (index: number) => {
    setForm((s) => ({
      ...s,
      variants: s.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariantRow = (
    index: number,
    field: keyof VariantRow,
    value: string
  ) => {
    setForm((s) => ({
      ...s,
      variants: s.variants.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-neutral-600">
          Add different sizes/types for each product. Upload images here — they're saved in
          <code className="rounded bg-neutral-100 px-1">public/uploads</code> on the server.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {msg}
        </div>
      )}

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit product" : "Add product"}
          </h2>

          <div
            role="button"
            tabIndex={0}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!uploading) fileInputRef.current?.click();
              }
            }}
            className={`cursor-pointer rounded-xl border-2 border-dashed border-[#e60000]/35 bg-linear-to-br from-[#fff8f5] to-[#fdf6e8] p-3 text-center transition hover:border-[#e60000]/60 hover:shadow-sm ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload className="mx-auto h-8 w-8 text-[#e60000]" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-neutral-900">Upload product image</p>
            <p className="mt-0.5 text-xs text-neutral-600">
              Click or drag PNG/JPG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              disabled={uploading}
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              {uploading ? "Uploading…" : "Square (1:1)"}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <label className="block text-xs font-semibold uppercase text-neutral-500">
              Name
              <input
                required
                className="mt-1 w-full rounded-xl border px-3 py-2.5 sm:py-3 text-sm outline-none ring-[#e60000]/30 focus:ring-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-neutral-500">
              Base price (₹){" "}
              <span className="normal-case font-normal text-neutral-400">
                {form.variants.length ? "(minimum price from sizes auto)" : ""}
              </span>
              <input
                required={form.variants.length === 0}
                type="number"
                min={0}
                step={1}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                disabled={form.variants.length > 0}
              />
            </label>
          </div>

          <label className="block text-xs font-semibold uppercase text-neutral-500">
            Category
            <select
              required
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase text-neutral-500">
            Description
            <textarea
              className="mt-1 min-h-22 w-full rounded-xl border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label className="block text-xs font-semibold uppercase text-neutral-500">
            Image URL (optional — auto-filled from upload)
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="/uploads/photo.jpg"
            />
          </label>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">
                  Types / sizes
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Example: "Margherita Pizza - ₹100", "Medium - ₹180", "Large - ₹300".
                  Leave empty = use base price only.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e60000]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#e60000] hover:bg-red-50"
              >
                <Plus className="h-4 w-4" />
                Add type
              </button>
            </div>
            {form.variants.length === 0 ? (
              <p className="mt-3 text-xs italic text-neutral-500">
                Abhi koi type nahi — card par ek hi price dikhega.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {form.variants.map((row, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-2 ring-1 ring-neutral-200"
                  >
                    <label className="min-w-0 flex-1 text-[10px] font-semibold uppercase text-neutral-500">
                      Label
                      <input
                        className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm normal-case"
                        value={row.label}
                        onChange={(e) =>
                          updateVariantRow(i, "label", e.target.value)
                        }
                        placeholder="e.g. Margherita Pizza Medium"
                      />
                    </label>
                    <label className="w-28 text-[10px] font-semibold uppercase text-neutral-500">
                      ₹
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm normal-case tabular-nums"
                        value={row.price}
                        onChange={(e) =>
                          updateVariantRow(i, "price", e.target.value)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVariantRow(i)}
                      className="mb-0.5 rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isVeg}
              onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
            />
            Vegetarian
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white shadow-md"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-neutral-200 bg-[#fdf6e8]/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-600">
            Live card preview
          </h3>
          <div className="rounded-2xl bg-[#fdf6e8] p-3 shadow-md ring-1 ring-black/5">
            <div className="flex gap-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">
                <Image
                  src={form.image || "/placeholder-food.svg"}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={
                    !!form.image &&
                    (form.image.startsWith("http") || form.image.startsWith("//"))
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#e60000]">
                  {form.name || "Product name"}
                </p>
                <p className="line-clamp-2 text-xs text-neutral-600">
                  {form.description || "Description"}
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#e60000]">
                  {(() => {
                    const rows = form.variants
                      .map((v) => Number(v.price))
                      .filter((n) => Number.isFinite(n) && n >= 0);
                    if (rows.length) {
                      const m = Math.min(...rows);
                      return rows.length > 1 || form.variants.filter((v) => v.label.trim()).length > 1
                        ? `From ₹ ${m}`
                        : `₹ ${m}`;
                    }
                    return `₹ ${form.price || "0"}`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm focus:border-[#e60000] focus:outline-none focus:ring-2 focus:ring-[#e60000]/20"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-neutral-600">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[#e60000] focus:outline-none focus:ring-2 focus:ring-[#e60000]/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-neutral-500">
          Showing <span className="font-semibold text-neutral-700">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold text-neutral-700">{products.length}</span> products
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Types</th>
              <th className="px-4 py-3">Veg</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  {products.length === 0 ? "No products yet" : "No products match your search"}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums">₹ {p.price}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {p.variants?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">{p.isVeg ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-2 text-[#e60000] hover:underline"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => onDelete(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
