"use client";

import { X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/features/cart/cart-context";

type Props = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

function imgSrc(url?: string) {
  if (!url) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { lines, inc, dec, remove, subtotal } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-90">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffdf8] shadow-2xl animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4">
          <h2 className="font-body text-lg font-bold text-neutral-900">
            Your Cart
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

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              Cart is empty. Add something delicious!
            </p>
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
                    <p className="text-sm font-semibold text-neutral-900 line-clamp-2">
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
          <div className="border-t border-neutral-200/80 bg-white/90 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="text-lg font-extrabold tabular-nums text-[#e60000]">
                ₹ {subtotal}
              </span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
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
