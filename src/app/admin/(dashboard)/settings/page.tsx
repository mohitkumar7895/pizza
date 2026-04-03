"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { fetchSettings, updateSettings } from "@/services/settings";
import { uploadImage } from "@/services/products";

const LABELS = [
  "Banner 1 (baayin / mobile pe upar)",
  "Banner 2 (beech)",
  "Banner 3 (daayin)",
] as const;

export default function AdminSettingsPage() {
  const [slots, setSlots] = useState<[string, string, string]>(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef0 = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const fileRefs = [fileRef0, fileRef1, fileRef2] as const;
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await fetchSettings();
      setSlots(s.heroImages);
    } catch {
      setMsg("Settings load nahi hui — login / DB check karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setSlot = (index: number, value: string) => {
    setSlots((prev) => {
      const next: [string, string, string] = [...prev];
      next[index] = value;
      return next;
    });
  };

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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Homepage banners</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Yahan se <strong>teen</strong> wide banner images set karein (ja reference: teen panels ek
          line mein). Website par &quot;Welcome to&quot; text hat jayega — sirf yeh images dikhengi.
          Har box par click / upload se file <code className="rounded bg-neutral-100 px-1">public/uploads</code>{" "}
          mein save hoti hai.
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
                  {LABELS[i]}
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
                        value={slots[i]}
                        onChange={(e) => setSlot(i, e.target.value)}
                        placeholder="/uploads/banner1.jpg"
                      />
                    </label>
                    {slots[i].trim() ? (
                      <div className="relative mt-2 aspect-[21/9] w-full max-w-xl overflow-hidden rounded-xl bg-neutral-100">
                        <Image
                          src={slots[i].trim()}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={
                            slots[i].startsWith("http") ||
                            slots[i].startsWith("//")
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">Abhi koi image nahi</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setMsg(null);
                try {
                  await updateSettings(slots);
                  setMsg("Save ho gaya — homepage refresh karein.");
                } catch {
                  setMsg("Save fail — try again.");
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-full bg-[#e60000] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save banners"}
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
