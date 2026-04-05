"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Phone } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";
import { fetchNavbar, type NavbarDTO } from "@/services/navbar";
import { WavySeparator } from "./WavySeparator";

export function Navbar({ onCartClick }: { onCartClick?: () => void }) {
  const { itemCount } = useCart();
  const displayCount = itemCount > 99 ? "99+" : String(itemCount);

  const [data, setData] = useState<NavbarDTO | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    return fetchNavbar()
      .then(setData)
      .catch(() => setData({ logoUrl: "", brand: "", tagline: "", phone: "" }))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const logoUrl = data?.logoUrl.trim() ?? "";
  const brand = data?.brand.trim() ?? "";
  const taglineText = data?.tagline.trim() ?? "";
  const callPhone = data?.phone.trim() ?? "";

  const logoUnopt =
    logoUrl &&
    (logoUrl.startsWith("http") ||
      logoUrl.startsWith("//") ||
      logoUrl.startsWith("/uploads"));

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-1 sm:gap-3 sm:px-5 sm:py-2">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#D30000]/35 focus-visible:ring-offset-2 sm:gap-2.5"
          aria-label={brand ? brand : "Home"}
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#faf8f5] ring-2 ring-[#D30000]/20 sm:h-10 sm:w-10">
            {!ready ? (
              <span className="absolute inset-0 animate-pulse bg-neutral-200" />
            ) : logoUrl ? (
              <Image
                key={logoUrl}
                src={logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                priority
                unoptimized={Boolean(logoUnopt)}
              />
            ) : (
              <span className="absolute inset-0 bg-neutral-100" aria-hidden />
            )}
          </span>
          <span className="min-w-0">
            {!ready ? (
              <>
                <span className="block h-[1.1rem] w-36 max-w-[55vw] animate-pulse rounded bg-neutral-200 sm:h-7 sm:w-44" />
                <span className="mt-1 block h-2.5 w-28 max-w-[45vw] animate-pulse rounded bg-neutral-100 sm:mt-1.5" />
              </>
            ) : (
              <>
                {brand ? (
                  <p className="font-navbar-brand text-[clamp(1.05rem,3.4vw,1.55rem)] font-semibold leading-none tracking-tight text-[#D30000] transition-transform duration-200 group-hover:scale-[1.02] sm:text-[clamp(1.15rem,3.6vw,1.72rem)] sm:font-bold">
                    {brand}
                  </p>
                ) : (
                  <span className="block min-h-[1.1rem] sm:min-h-7" aria-hidden />
                )}
                {taglineText ? (
                  <p className="font-navbar-hindi mt-px max-w-52.5 text-[9px] font-semibold leading-tight text-[#008000] sm:mt-0.5 sm:max-w-none sm:text-[11px] sm:leading-snug">
                    {taglineText}
                  </p>
                ) : null}
              </>
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {!ready ? (
            <span
              className="inline-flex h-8 w-[4.75rem] shrink-0 animate-pulse rounded-full bg-neutral-200 sm:h-9 md:h-10"
              aria-hidden
            />
          ) : callPhone ? (
            <a
              href={`tel:${callPhone.replace(/\s/g, "")}`}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#D30000] px-2.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.09em] text-white shadow-[0_2px_0_#9a0000] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-9 sm:gap-1.5 sm:px-4 sm:text-[0.65rem] sm:tracking-widest md:h-10 md:px-5 md:text-xs"
            >
              <Phone
                className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[2.5] sm:h-4 sm:w-4 md:h-[1.1rem] md:w-[1.1rem]"
                aria-hidden
              />
              Call
            </a>
          ) : null}
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D30000] text-white shadow-[0_2px_0_#9a0000] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-10 sm:w-10 md:h-11 md:w-11"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingCart
              className="h-3.5 w-3.5 sm:h-[1.05rem] sm:w-[1.05rem] md:h-5 md:w-5"
              strokeWidth={2.25}
            />
            <span className="font-body absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#a80000] px-0.5 text-[9px] font-bold leading-none text-white sm:h-[1.05rem] sm:min-w-[1.05rem] sm:text-[10px]">
              {displayCount}
            </span>
          </button>
        </div>
      </div>
      <WavySeparator />
    </header>
  );
}
