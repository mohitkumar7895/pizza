"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import type { ProductDTO, ProductVariant } from "@/types";
import { useCart } from "@/features/cart/cart-context";

type Props = {
  open: boolean;
  product: ProductDTO | null;
  onClose: () => void;
};

function resolveImage(url: string | undefined) {
  if (!url || url.length === 0) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function AddToCartModal({ open, product, onClose }: Props) {
  const { addLine } = useCart();
  const options = useMemo<ProductVariant[]>(() => {
    const Variants = product?.variants;
    if (Variants && Variants.length > 0) {
      return Variants.map((v, i) => ({
        id: `v-${i}`,
        label: v.label,
        price: v.price,
      }));
    }
    if (!product) return [];
    return [
      {
        id: "default",
        label: product.name,
        price: product.price,
      },
    ];
  }, [product]);

  const [quantity, setQuantity] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => options[0]?.id ?? "default",
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const active =
    options.find((o) => o.id === selectedId) ?? options[0] ?? null;
  const unit = active?.price ?? product.price;
  const lineTotal = unit * quantity;
  const hasDbVariants = (product.variants?.length ?? 0) > 0;

  const src = resolveImage(product.image);

  const lineName = (() => {
    if (hasDbVariants && active) {
      return active.label;
    }
    if (active && active.id !== "default") {
      return `${product.name} (${active.label})`;
    }
    return product.name;
  })();

  const typesLabel = hasDbVariants ? "Types:" : "Option";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity animate-in fade-in"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(90dvh,calc(100svh-1.5rem))] w-full max-w-[min(100%,22rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-300 sm:max-h-[min(88vh,900px)] sm:max-w-lg sm:rounded-3xl sm:shadow-2xl"
      >
        {/* Header: mobile = small image left + text right (reference) */}
        <div className="relative shrink-0 px-5 pb-1 pt-5 sm:px-6 sm:pb-2 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="flex flex-row items-start gap-3 pr-7 sm:gap-4 sm:pr-8">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 sm:h-28 sm:w-28 sm:rounded-2xl sm:ring-0 sm:ring-transparent sm:shadow-inner">
              <Image
                src={src}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={src.startsWith("http")}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <h2
                id="add-modal-title"
                className="font-body text-[0.95rem] font-bold leading-tight text-neutral-900 sm:text-lg md:text-xl"
              >
                {product.name}
              </h2>
              <p className="mt-1 line-clamp-3 text-[0.8125rem] leading-snug text-neutral-500 sm:line-clamp-none sm:text-sm">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
          <div className="space-y-4 pb-2 pt-2 sm:space-y-5 sm:pt-0">
            <div>
              <p className="mb-2 text-sm text-neutral-500">Quantity</p>
              <div className="flex justify-start">
                <div className="inline-flex items-stretch gap-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center bg-white text-neutral-700 transition hover:bg-neutral-50 active:bg-neutral-100"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex min-w-[2.5rem] items-center justify-center bg-neutral-100 px-2 text-center text-base font-semibold tabular-nums text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center bg-white text-neutral-700 transition hover:bg-neutral-50 active:bg-neutral-100"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-neutral-500">{typesLabel}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {options.map((o) => {
                  const selected = o.id === (selectedId ?? options[0]?.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedId(o.id)}
                      className={`w-full rounded-full border-2 px-4 py-2.5 text-left text-sm font-semibold transition sm:w-auto sm:py-2 ${
                        selected
                          ? "border-[#e60000] bg-[#e60000] text-white shadow-sm"
                          : "border-[#e60000] bg-white text-neutral-900 hover:bg-red-50/80 active:scale-[0.99]"
                      }`}
                    >
                      {o.label} - ₹ {o.price}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-200 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6 sm:pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e60000] py-3.5 text-[0.95rem] font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-[#d40000] active:scale-[0.99] sm:text-base"
            onClick={() => {
              addLine({
                productId: product._id,
                name: lineName,
                price: unit,
                quantity,
                image: product.image,
                isVeg: product.isVeg,
              });
              onClose();
            }}
          >
            <ShoppingBag className="hidden h-5 w-5 shrink-0 sm:inline-block" />
            <span>Add to Cart - ₹ {lineTotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
