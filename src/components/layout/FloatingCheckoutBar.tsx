"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";

type Props = {
  onOpenCart: () => void;
};

export function FloatingCheckoutBar({ onOpenCart }: Props) {
  const { itemCount, subtotal, lines } = useCart();

  if (lines.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom,12px)] pt-2 sm:px-6">
      <button
        type="button"
        onClick={onOpenCart}
        className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-full bg-[#e60000] px-5 py-3.5 text-left text-white shadow-[0_-8px_40px_rgba(230,0,0,0.35)] transition hover:scale-[1.01] hover:shadow-[0_-12px_48px_rgba(230,0,0,0.45)] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <p className="text-base font-extrabold tabular-nums">
              ₹ {subtotal}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#e60000]">
          View cart
        </span>
      </button>
    </div>
  );
}
