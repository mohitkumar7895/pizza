import type { ProductDTO, ProductVariantItem } from "@/types";

type LeanProduct = {
  _id: { toString: () => string };
  name: string;
  description?: string;
  price: number;
  category: string;
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
  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? "",
    price: doc.price,
    category: doc.category,
    image: doc.image ?? "",
    isVeg: doc.isVeg,
    variants: variants.length ? variants : undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
