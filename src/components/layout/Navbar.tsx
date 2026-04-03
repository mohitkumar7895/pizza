"use client";

import Link from "next/link";
import { ShoppingCart, Phone } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";
import { WavySeparator } from "./WavySeparator";

const PHONE =
  process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "+919999999999";

export function Navbar({ onCartClick }: { onCartClick?: () => void }) {
  const { itemCount } = useCart();
  const displayCount = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="group min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-[#D30000]/35 focus-visible:ring-offset-2"
        >
          <p className="font-navbar-brand text-[clamp(1.2rem,3.8vw,1.85rem)] font-semibold leading-none tracking-tight text-[#D30000] transition-transform duration-200 group-hover:scale-[1.02] sm:text-[clamp(1.35rem,4vw,2rem)] sm:font-bold">
            Ad Pizza Hub
          </p>
          <p className="font-navbar-hindi mt-0.5 max-w-[220px] text-[10px] font-semibold leading-tight text-[#008000] sm:mt-1 sm:max-w-none sm:text-xs sm:leading-snug">
            आपका अपना रेस्टोरेंट सैफई
          </p>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          <a
            href={`tel:${PHONE.replace(/\s/g, "")}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#D30000] px-3 font-body text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white shadow-[0_2px_0_#9a0000] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-11 sm:gap-2 sm:px-5 sm:text-xs sm:tracking-[0.12em] md:h-12 md:px-6 md:text-sm"
          >
            <Phone
              className="h-[1rem] w-[1rem] shrink-0 stroke-[2.5] sm:h-[1.15rem] sm:w-[1.15rem] md:h-5 md:w-5"
              aria-hidden
            />
            Call
          </a>
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D30000] text-white shadow-[0_2px_0_#9a0000] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-11 sm:w-11 md:h-[52px] md:w-[52px]"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingCart
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-[1.35rem] md:w-[1.35rem]"
              strokeWidth={2.25}
            />
            <span className="font-body absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-[2.5px] border-white bg-[#a80000] px-0.5 text-[10px] font-bold leading-none text-white sm:h-5 sm:min-w-5 sm:text-[11px]">
              {displayCount}
            </span>
          </button>
        </div>
      </div>
      <WavySeparator />
    </header>
  );
}
