import type { Types } from "mongoose";
import type { ProductDTO, ProductVariantItem } from "@/types";

type PopulatedCategoryId = { _id: Types.ObjectId; name: string };

type LeanProduct = {
  _id: { toString: () => string };
  name: string;
  description?: string;
  price: number;
  category: string;
  categoryId?: Types.ObjectId | PopulatedCategoryId | null;
  image?: string;
  isVeg: boolean;
  variants?: ProductVariantItem[];
  createdAt?: Date;
  updatedAt?: Date;
};

export function toProductDTO(doc: LeanProduct): ProductDTO {
  const variants = Array.isArray(doc.variants)
    ? doc.variants.map((v) => ({
        label: v.label,
        price: v.price,
      }))
    : [];

  let category = doc.category;
  let categoryId: string | undefined;
  const cid = doc.categoryId;
  if (cid && typeof cid === "object" && "name" in cid) {
    category = (cid as PopulatedCategoryId).name;
    categoryId = (cid as PopulatedCategoryId)._id.toString();
  } else if (cid != null && cid !== null) {
    categoryId = String(cid);
  }

  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? "",
    price: doc.price,
    categoryId,
    category,
    image: doc.image ?? "",
    isVeg: doc.isVeg,
    variants: variants.length ? variants : undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
