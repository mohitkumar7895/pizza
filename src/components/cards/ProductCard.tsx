"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@/types";
import { NonVegIcon, VegIcon } from "@/components/common/VegIcon";
import { ImageLightbox } from "@/components/modals/ImageLightbox";

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
    return { text: `₹ ${minP}`, sub: `${v.length} types` };
  }
  return { text: `₹ ${product.price}` };
}

export function ProductCard({ product, onAdd }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const src = resolveImage(product.image);
  const priceLine = cardPriceLabel(product);
  const imgUnopt =
    src.startsWith("http") || src.startsWith("//") || src.startsWith("/uploads");

  return (
    <>
      <article
        className="group flex items-stretch overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_5px_20px_-10px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-12px_rgba(227,0,0,0.12)]"
      >
      {/* Left: larger image, fills strip height */}
      <div className="flex w-[36%] min-w-22 shrink-0 items-center justify-center bg-white px-1 py-1 sm:min-w-25 sm:px-1.5 sm:py-1.5 md:w-[34%]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square w-full max-w-22 overflow-hidden rounded-md bg-neutral-100 hover:opacity-80 transition cursor-pointer sm:max-w-25 md:rounded-lg md:max-w-26"
          aria-label="View image"
        >
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 88px, (max-width:1024px) 100px, 104px"
            unoptimized={imgUnopt}
          />
        </button>
      </div>

      {/* Right: yellow panel — title + desc; bottom row = ₹ | Add */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0 bg-[#FFEFD5] py-1 pl-1.5 pr-1.5 sm:py-1.5 sm:pl-2 sm:pr-2">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <span className="mt-px shrink-0">
              {product.isVeg ? <VegIcon /> : <NonVegIcon />}
            </span>
            <h3 className="line-clamp-2 font-body text-[0.75rem] font-bold leading-[1.15] text-[#E30000] sm:text-[0.8125rem]">
              {product.name}
            </h3>
          </div>
          <p className="mt-px line-clamp-1 pl-6 font-body text-[0.625rem] leading-tight text-neutral-800 sm:text-[10px]">
            {product.description || "—"}
          </p>
        </div>

        <div className="mt-0.5 flex flex-nowrap items-center justify-between gap-1.5 pl-6 sm:mt-1">
          <div className="min-w-0">
            <p className="font-body text-sm font-extrabold tabular-nums leading-none tracking-tight text-[#E30000] sm:text-base">
              {priceLine.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-[#E30000] px-2.5 py-2 min-h-10 text-[9px] font-bold uppercase tracking-wide text-white shadow-[0_3px_12px_-2px_rgba(227,0,0,0.45)] transition hover:scale-[1.03] hover:shadow-[0_5px_16px_-3px_rgba(227,0,0,0.5)] active:scale-[0.98] sm:px-3 sm:py-2.5 sm:text-[10px] sm:min-h-max"
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            Add
          </button>
        </div>
      </div>
      </article>

      <ImageLightbox
        open={lightboxOpen}
        src={src}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
