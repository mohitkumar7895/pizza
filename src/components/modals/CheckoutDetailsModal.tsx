"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }) => Promise<void>;
};

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const r = await fetch(
    `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
  );
  if (!r.ok) return null;
  const j = (await r.json()) as { address?: string | null };
  const a = j.address?.trim();
  return a || null;
}

export function CheckoutDetailsModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const autoFetchDoneRef = useRef(false);

  const fillAddressFromLocation = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!navigator.geolocation) {
        if (!silent) setErr("Location is not supported on this device.");
        return;
      }
      setLocating(true);
      if (!silent) setErr(null);
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 60_000,
          });
        });
        const line = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (line) {
          setAddress(line);
          if (!silent) setErr(null);
        } else if (!silent) {
          setErr("Could not resolve address. Type it manually.");
        }
      } catch {
        if (!silent) {
          setErr(
            "Location permission denied or unavailable. Allow location or enter address manually."
          );
        }
      } finally {
        setLocating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!open) {
      autoFetchDoneRef.current = false;
      return;
    }
    if (autoFetchDoneRef.current) return;
    if (address.trim()) return;

    autoFetchDoneRef.current = true;
    const t = window.setTimeout(() => {
      void fillAddressFromLocation({ silent: true });
    }, 400);

    return () => window.clearTimeout(t);
  }, [open, address, fillAddressFromLocation]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const n = name.trim();
    const p = phone.trim();
    const a = address.trim();
    if (!n || !p || !a) {
      setErr("Please fill all fields.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        customerName: n,
        customerPhone: p,
        customerAddress: a,
      });
    } catch {
      setErr("Could not place order. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-3xl sm:animate-in sm:fade-in sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2
            id="checkout-title"
            className="font-body text-lg font-bold text-neutral-800"
          >
            Update Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5"
        >
          <label className="block">
            <span className="font-body text-sm font-medium text-neutral-700">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-body text-sm text-neutral-900 outline-none ring-[#e60000]/20 focus:border-[#e60000]/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="font-body text-sm font-medium text-neutral-700">
              Mobile
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-body text-sm text-neutral-900 outline-none ring-[#e60000]/20 focus:border-[#e60000]/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-sm font-medium text-neutral-700">
                Address
              </span>
              <button
                type="button"
                onClick={() => void fillAddressFromLocation({ silent: false })}
                disabled={locating || busy}
                className="font-body text-xs font-semibold text-[#e60000] underline-offset-2 hover:underline disabled:opacity-50"
              >
                {locating ? "Getting location…" : "Use current location"}
              </button>
            </div>
            <div className="relative mt-1.5">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                autoComplete="street-address"
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 font-body text-sm text-neutral-900 outline-none ring-[#e60000]/20 focus:border-[#e60000]/40 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void fillAddressFromLocation({ silent: false })}
                disabled={locating || busy}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-[#e60000] transition hover:bg-red-50 disabled:opacity-50"
                aria-label="Fill address from current location"
              >
                {locating ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <MapPin className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </label>

          {err && (
            <p className="text-center text-sm text-red-600" role="alert">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || locating}
            className="w-full rounded-xl bg-[#e60000] py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:opacity-95 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
