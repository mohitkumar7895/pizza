"use client";

import { X, ShoppingCart } from "lucide-react";
import { MIN_ORDER_AMOUNT } from "@/lib/order-constants";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddItem: () => void;
};

export function MinimumOrderModal({ open, onClose, onAddItem }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[22rem] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="min-order-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top: cream panel + illustration + orange bar */}
        <div className="relative rounded-t-2xl bg-[#FDF5E6] px-4 pb-0 pt-8 text-center">
          <p
            id="min-order-title"
            className="font-body text-[0.9375rem] font-bold text-[#422006]"
          >
            Minimum Order Amount
          </p>

          <div className="relative mx-auto mt-4 flex h-[7.5rem] w-full max-w-[17rem] items-end justify-center">
            <span
              className="absolute left-0 top-[42%] text-lg font-bold text-neutral-500"
              aria-hidden
            >
              −
            </span>
            <span
              className="absolute right-0 top-[42%] text-lg font-bold text-neutral-500"
              aria-hidden
            >
              +
            </span>

            {/* Semicircle progress: green left, grey right */}
            <svg
              className="absolute bottom-13 left-1/2 w-44 -translate-x-1/2"
              viewBox="0 0 200 78"
              aria-hidden
            >
              <path
                d="M 38 70 A 62 62 0 0 1 100 8"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 100 8 A 62 62 0 0 1 162 70"
                fill="none"
                stroke="#d4d4d4"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>

            {/* Cart + colourful boxes */}
            <div className="relative flex flex-col items-center">
              <div className="relative flex items-end justify-center gap-0.5 pb-0.5">
                <span
                  className="mb-2 h-4 w-4 rounded-sm bg-fuchsia-400 shadow-sm"
                  aria-hidden
                />
                <span
                  className="mb-3 h-4 w-4 rounded-sm bg-violet-500 shadow-sm"
                  aria-hidden
                />
                <span
                  className="mb-1.5 h-4 w-4 rounded-sm bg-orange-400 shadow-sm"
                  aria-hidden
                />
              </div>
              <div className="flex items-center justify-center text-[#1e3a5f]">
                <ShoppingCart className="h-11 w-11" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full bg-[#E67E22]" />
        </div>

        <div className="px-5 pb-6 pt-5">
          <h2 className="font-body text-center text-lg font-bold text-neutral-900">
            Important Notice
          </h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
            Minimum order value is ₹ {MIN_ORDER_AMOUNT}, Please add more item to
            checkout.
          </p>
          <button
            type="button"
            onClick={() => {
              onAddItem();
              onClose();
            }}
            className="mt-6 w-full rounded-lg bg-[#E30606] py-3 text-center font-body text-sm font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-[#c50505] active:scale-[0.99]"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
