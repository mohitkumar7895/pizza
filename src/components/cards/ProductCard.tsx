"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@/types";
import { NonVegIcon, VegIcon } from "@/components/common/VegIcon";

type Props = {
  product: ProductDTO;
  onAdd: (product: ProductDTO) => void;
};

function resolveImage(url: string | undefined) {
  if (!url || url.length === 0) return "/placeholder-food.svg";
  if (url.startsWith("http") || url.startsWith("//")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

function cardPriceLabel(product: ProductDTO): { text: string; sub?: string } {
  const v = product.variants;
  if (v && v.length > 0) {
    const minP = Math.min(...v.map((x) => x.price));
    const maxP = Math.max(...v.map((x) => x.price));
    if (minP === maxP) {
      return { text: `₹ ${minP}`, sub: `${v.length} type` };
    }
    return { text: `From ₹ ${minP}`, sub: `${v.length} types` };
  }
  return { text: `₹ ${product.price}` };
}

export function ProductCard({ product, onAdd }: Props) {
  const src = resolveImage(product.image);
  const priceLine = cardPriceLabel(product);
  const imgUnopt =
    src.startsWith("http") || src.startsWith("//") || src.startsWith("/uploads");

  return (
    <article
      className="group flex overflow-hidden rounded-[20px] shadow-[0_10px_36px_-14px_rgba(0,0,0,0.2)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-12px_rgba(227,0,0,0.18)]"
    >
      {/* Left: white panel + image (fixed box so Next/Image fill always works) */}
      <div className="flex w-[32%] min-w-[6.5rem] shrink-0 flex-col items-center justify-center bg-white px-2 py-3 sm:w-[35%] sm:min-w-[7.5rem] sm:px-3 sm:py-4">
        <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28">
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="112px"
            unoptimized={imgUnopt}
          />
        </div>
      </div>

      {/* Right: cream panel + details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 bg-[#F9F9F0] p-3 text-neutral-900 sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              {product.isVeg ? <VegIcon /> : <NonVegIcon />}
            </span>
            <h3 className="font-body text-[0.95rem] font-bold leading-snug text-[#E30000] sm:text-base">
              {product.name}
            </h3>
          </div>
          <p className="mt-1.5 line-clamp-2 pl-6 font-body text-xs leading-relaxed text-neutral-800 sm:text-sm">
            {product.description || "—"}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="font-body text-base font-extrabold tabular-nums text-[#E30000] sm:text-lg">
              {priceLine.text}
            </p>
            {priceLine.sub && (
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {priceLine.sub}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E30000] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_6px_18px_-4px_rgba(227,0,0,0.65)] transition hover:scale-[1.05] hover:shadow-[0_8px_22px_-4px_rgba(227,0,0,0.65)] active:scale-95 sm:px-4 sm:text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
