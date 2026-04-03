"use client";

import { X, Plus, Minus, Trash2, Utensils } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/features/cart/cart-context";
import {
  MIN_ORDER_AMOUNT,
  PREMIUM_ORDER_THRESHOLD,
} from "@/lib/order-constants";

type Props = {
  open: boolean;
  onClose: () => void;
  /** User tapped Place order — parent runs min-order + checkout flow */
  onRequestCheckout: () => void;
  /** Empty cart — go to menu (scroll top / close) */
  onOrderNow: () => void;
};

function imgSrc(url?: string) {
  if (!url) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function CartDrawer({
  open,
  onClose,
  onRequestCheckout,
  onOrderNow,
}: Props) {
  const { lines, inc, dec, remove, subtotal } = useCart();

  if (!open) return null;

  const belowMin = lines.length > 0 && subtotal < MIN_ORDER_AMOUNT;
  const premium = lines.length > 0 && subtotal > PREMIUM_ORDER_THRESHOLD;

  return (
    <div className="fixed inset-0 z-90">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4">
          <h2 className="font-body text-lg font-bold text-neutral-900">
            My Cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center px-2 text-center">
              <div className="relative flex h-52 w-full max-w-[280px] items-center justify-center">
                <div
                  className="absolute h-44 w-44 rounded-full bg-pink-100/95"
                  aria-hidden
                />
                <div className="relative flex flex-col items-center gap-2">
                  <span className="text-5xl" aria-hidden>
                    🛒
                  </span>
                  <span className="text-4xl leading-none" aria-hidden>
                    🙁
                  </span>
                </div>
              </div>
              <p className="mt-6 font-body text-base font-semibold text-neutral-800">
                Your cart is feeling lonely 😔
              </p>
              <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-neutral-500">
                Looks like you haven&apos;t added anything yet. Explore our
                delicious menu and start ordering!
              </p>
              <button
                type="button"
                onClick={onOrderNow}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e60000] px-8 py-3.5 font-body text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_28px_-6px_rgba(230,0,0,0.45)] transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Utensils className="h-5 w-5" aria-hidden />
                Order Now
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="flex gap-3 rounded-2xl bg-[#fdf6e8] p-3 shadow-sm"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={imgSrc(line.image)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={imgSrc(line.image).startsWith("http")}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-xs font-bold tabular-nums text-[#e60000]">
                      ₹ {line.price} × {line.quantity}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dec(line.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => inc(line.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="ml-auto rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-neutral-200/80 bg-[#fffdf8] p-5">
            {premium && !belowMin && (
              <div className="mb-3 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2.5 text-center text-xs font-medium text-emerald-950">
                Great! Your order is above ₹ {PREMIUM_ORDER_THRESHOLD} — we&apos;ll
                prioritise it in the kitchen.
              </div>
            )}
            {!belowMin && !premium && (
              <div className="mb-3 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-center text-xs text-neutral-600">
                You&apos;re ready to place your order. We&apos;ll confirm on the
                next step.
              </div>
            )}
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="text-lg font-extrabold tabular-nums text-[#e60000]">
                ₹ {subtotal}
              </span>
            </div>
            <button
              type="button"
              onClick={onRequestCheckout}
              className="w-full rounded-full bg-[#e60000] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-red-500/35 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              Place Order — ₹ {subtotal}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
