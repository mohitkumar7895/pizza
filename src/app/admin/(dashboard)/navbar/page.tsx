"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  fetchNavbar,
  updateNavbar,
  type NavbarDTO,
} from "@/services/navbar";
import { uploadImage } from "@/services/products";

const emptyNavbar = (): NavbarDTO => ({
  logoUrl: "",
  brand: "",
  tagline: "",
  phone: "",
});

export default function AdminNavbarPage() {
  const [s, setS] = useState<NavbarDTO>(emptyNavbar);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setS(await fetchNavbar());
    } catch {
      setMsg("Failed to load — check login and database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onLogoUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingLogo(true);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setS((p) => ({ ...p, logoUrl: url }));
    } catch {
      setMsg("Logo upload failed — try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateNavbar(s);
      setMsg("Saved — refresh the menu page to verify.");
    } catch {
      setMsg("Save failed — try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Navbar</h1>
        <p className="mt-1 text-xs text-neutral-600 sm:mt-2 sm:text-sm">
          Top bar on the public menu: logo, title, tagline, and Call number. Leave any
          field empty to hide that part (Call hides if phone is empty).
        </p>
      </div>

      {msg && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {msg}
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={() => !uploadingLogo && logoFileRef.current?.click()}
                disabled={uploadingLogo}
                className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e60000]/40 bg-linear-to-br from-[#fff8f5] to-[#fdf6e8] px-4 py-4 text-center transition hover:border-[#e60000]/70 disabled:opacity-50 sm:w-40"
              >
                <Upload className="h-7 w-7 text-[#e60000]" />
                <span className="mt-1.5 text-xs font-medium text-neutral-700">
                  Upload logo
                </span>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoUpload(e.target.files?.[0] ?? null)}
                />
                {uploadingLogo && (
                  <span className="mt-2 text-xs text-[#e60000]">Upload…</span>
                )}
              </button>
              <div className="min-w-0 flex-1 space-y-3">
                <label className="block text-xs font-semibold uppercase text-neutral-500">
                  Logo URL
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={s.logoUrl}
                    onChange={(e) =>
                      setS((p) => ({ ...p, logoUrl: e.target.value }))
                    }
                    placeholder="https://… or /uploads/…"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-neutral-500">
                  Brand (main title)
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={s.brand}
                    onChange={(e) =>
                      setS((p) => ({ ...p, brand: e.target.value }))
                    }
                    placeholder="Restaurant name"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-neutral-500">
                  Tagline (green line under title)
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={s.tagline}
                    onChange={(e) =>
                      setS((p) => ({ ...p, tagline: e.target.value }))
                    }
                    placeholder="Short line (optional)"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-neutral-500">
                  Phone for Call button
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={s.phone}
                    onChange={(e) =>
                      setS((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 …"
                  />
                </label>
              </div>
            </div>
            {s.logoUrl.trim() ? (
              <div className="relative mt-4 h-16 w-16 overflow-hidden rounded-full border bg-neutral-50">
                <Image
                  src={s.logoUrl.trim()}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={
                    s.logoUrl.startsWith("http") || s.logoUrl.startsWith("//")
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-full bg-[#e60000] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save navbar"}
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold"
            >
              Reload
            </button>
          </div>
        </>
      )}
    </div>
  );
}
