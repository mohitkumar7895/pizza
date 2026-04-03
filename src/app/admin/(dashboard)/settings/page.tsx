"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  fetchSettings,
  updateSettings,
  type SiteSettingsDTO,
} from "@/services/settings";
import { uploadImage } from "@/services/products";

const BANNER_LABELS = [
  "Banner 1 (baayin / mobile pe upar)",
  "Banner 2 (beech)",
  "Banner 3 (daayin)",
] as const;

const emptySettings = (): SiteSettingsDTO => ({
  heroImages: ["", "", ""],
  restaurantAddress: "",
  restaurantInstruction: "",
  restaurantPhone: "",
  paymentQrImage: "",
});

export default function AdminSettingsPage() {
  const [s, setS] = useState<SiteSettingsDTO>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef0 = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const fileRefs = [fileRef0, fileRef1, fileRef2] as const;
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  const setSlot = (index: number, value: string) => {
    setS((prev) => {
      const heroImages: [string, string, string] = [...prev.heroImages];
      heroImages[index] = value;
      return { ...prev, heroImages };
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setS(await fetchSettings());
    } catch {
      setMsg("Settings load nahi hui — login / DB check karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIdx(index);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setSlot(index, url);
    } catch {
      setMsg("Upload fail — dubara try karein.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const onQrUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingQr(true);
    setMsg(null);
    try {
      const url = await uploadImage(file);
      setS((p) => ({ ...p, paymentQrImage: url }));
    } catch {
      setMsg("QR upload fail — dubara try karein.");
    } finally {
      setUploadingQr(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateSettings(s);
      setMsg("Save ho gaya — homepage / order page refresh karein.");
    } catch {
      setMsg("Save fail — try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Site settings</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Banners, outlet details, aur payment QR — sab yahan se. Order tracking
          page inhi values se banti hai.
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
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <p className="text-sm font-semibold text-neutral-800">
                  {BANNER_LABELS[i]}
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    onClick={() =>
                      uploadingIdx === null && fileRefs[i].current?.click()
                    }
                    disabled={uploadingIdx !== null}
                    className="flex w-full shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e60000]/40 bg-linear-to-br from-[#fff8f5] to-[#fdf6e8] px-4 py-8 text-center transition hover:border-[#e60000]/70 disabled:opacity-50 sm:w-52"
                  >
                    <Upload className="h-8 w-8 text-[#e60000]" />
                    <span className="mt-2 text-xs font-medium text-neutral-700">
                      Yahan click — image chuno
                    </span>
                    <input
                      ref={fileRefs[i]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        onUpload(i, e.target.files?.[0] ?? null)
                      }
                    />
                    {uploadingIdx === i && (
                      <span className="mt-2 text-xs text-[#e60000]">
                        Upload…
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1 space-y-2">
                    <label className="block text-xs font-semibold uppercase text-neutral-500">
                      Image URL (paste bhi kar sakte ho)
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        value={s.heroImages[i]}
                        onChange={(e) => setSlot(i, e.target.value)}
                        placeholder="/uploads/banner1.jpg"
                      />
                    </label>
                    {s.heroImages[i].trim() ? (
                      <div className="relative mt-2 aspect-[21/9] w-full max-w-xl overflow-hidden rounded-xl bg-neutral-100">
                        <Image
                          src={s.heroImages[i].trim()}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={
                            s.heroImages[i].startsWith("http") ||
                            s.heroImages[i].startsWith("//")
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">
                        Abhi koi image nahi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-neutral-900">
              Outlet & order tracking
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Customers ko order page par address, instruction aur QR yahi dikhega.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Restaurant phone (Call / WhatsApp)
                </span>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  value={s.restaurantPhone}
                  onChange={(e) =>
                    setS((p) => ({ ...p, restaurantPhone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Restaurant address
                </span>
                <textarea
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.restaurantAddress}
                  onChange={(e) =>
                    setS((p) => ({ ...p, restaurantAddress: e.target.value }))
                  }
                  placeholder="Full outlet address…"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Restaurant instruction (UPI / owner note)
                </span>
                <textarea
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm"
                  value={s.restaurantInstruction}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      restaurantInstruction: e.target.value,
                    }))
                  }
                  placeholder="Payment ke baare mein short note…"
                />
              </label>

              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500">
                  Payment QR image
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    onClick={() =>
                      !uploadingQr && qrFileRef.current?.click()
                    }
                    disabled={uploadingQr}
                    className="flex w-full shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm disabled:opacity-50 sm:w-40"
                  >
                    <Upload className="mx-auto h-7 w-7 text-[#e60000]" />
                    <span className="mt-2 text-xs font-medium">
                      {uploadingQr ? "Upload…" : "Upload QR"}
                    </span>
                    <input
                      ref={qrFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        onQrUpload(e.target.files?.[0] ?? null)
                      }
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      value={s.paymentQrImage}
                      onChange={(e) =>
                        setS((p) => ({
                          ...p,
                          paymentQrImage: e.target.value,
                        }))
                      }
                      placeholder="/uploads/qr.png"
                    />
                    {s.paymentQrImage.trim() ? (
                      <div className="relative mt-2 h-36 w-36 overflow-hidden rounded-xl border bg-white">
                        <Image
                          src={s.paymentQrImage.trim()}
                          alt=""
                          fill
                          className="object-contain p-2"
                          unoptimized={
                            s.paymentQrImage.startsWith("http") ||
                            s.paymentQrImage.startsWith("//")
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={saveAll}
              className="rounded-full bg-[#e60000] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save all settings"}
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold"
            >
              Reload from server
            </button>
          </div>
        </>
      )}
    </div>
  );
}
