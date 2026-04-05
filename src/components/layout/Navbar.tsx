"use client";

import Image from "next/image";
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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-1 sm:gap-3 sm:px-5 sm:py-2">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#D30000]/35 focus-visible:ring-offset-2 sm:gap-2.5"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#faf8f5] ring-2 ring-[#D30000]/20 sm:h-10 sm:w-10">
            <Image
              src="/favicon.ico"
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              priority
              unoptimized
            />
          </span>
          <span className="min-w-0">
            <p className="font-navbar-brand text-[clamp(1.05rem,3.4vw,1.55rem)] font-semibold leading-none tracking-tight text-[#D30000] transition-transform duration-200 group-hover:scale-[1.02] sm:text-[clamp(1.15rem,3.6vw,1.72rem)] sm:font-bold">
              Ad Pizza Hub
            </p>
            <p className="font-navbar-hindi mt-px max-w-52.5 text-[9px] font-semibold leading-tight text-[#008000] sm:mt-0.5 sm:max-w-none sm:text-[11px] sm:leading-snug">
              आपका अपना रेस्टोरेंट सैफई
            </p>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <a
            href={`tel:${PHONE.replace(/\s/g, "")}`}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-[#D30000] px-2.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.09em] text-white shadow-[0_2px_0_#9a0000] transition hover:brightness-105 active:translate-y-px active:brightness-95 sm:h-9 sm:gap-1.5 sm:px-4 sm:text-[0.65rem] sm:tracking-widest md:h-10 md:px-5 md:text-xs"
          >
            <Phone
              className="h-[0.9rem] w-[0.9rem] shrink-0 stroke-[2.5] sm:h-4 sm:w-4 md:h-[1.1rem] md:w-[1.1rem]"
              aria-hidden
            />
            Call
          </a>
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
