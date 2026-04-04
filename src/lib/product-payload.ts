import mongoose from "mongoose";
import { Category } from "@/lib/models/Category";
import type { ProductVariantItem } from "@/types";

export function normalizeVariants(raw: unknown): ProductVariantItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is Record<string, unknown> => v != null && typeof v === "object")
    .map((v) => ({
      label: String(v.label ?? "").trim(),
      price: Number(v.price),
    }))
    .filter(
      (v) =>
        v.label.length > 0 && Number.isFinite(v.price) && !Number.isNaN(v.price) && v.price >= 0
    );
}

export type SanitizedProductBody = {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  variants: ProductVariantItem[];
};

export type SanitizedProductWrite = SanitizedProductBody & {
  categoryId?: mongoose.Types.ObjectId;
};

/**
 * Resolves category string + optional categoryId from admin payload.
 * When categoryId is sent, category name always comes from the Category document (stays in sync on rename).
 */
export async function resolveProductWrite(
  body: Record<string, unknown>
): Promise<SanitizedProductWrite | null> {
  const parsed = sanitizeProductBody(body);
  if (!parsed) return null;

  const rawId = body.categoryId;
  if (
    typeof rawId === "string" &&
    rawId.length > 0 &&
    mongoose.Types.ObjectId.isValid(rawId)
  ) {
    const cat = await Category.findById(rawId).lean();
    if (!cat) return null;
    return {
      ...parsed,
      category: cat.name,
      categoryId: cat._id as mongoose.Types.ObjectId,
    };
  }

  const catByName = await Category.findOne({
    name: parsed.category,
  }).lean();
  if (catByName) {
    return {
      ...parsed,
      categoryId: catByName._id as mongoose.Types.ObjectId,
    };
  }

  return { ...parsed };
}

export function sanitizeProductBody(body: Record<string, unknown>): SanitizedProductBody | null {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!name || !category) return null;

  const variants = normalizeVariants(body.variants);
  let price = Number(body.price);
  if (variants.length > 0) {
    price = Math.min(...variants.map((v) => v.price));
  } else if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const isVeg = Boolean(body.isVeg);

  return {
    name,
    description,
    price,
    category,
    image,
    isVeg,
    variants,
  };
}
