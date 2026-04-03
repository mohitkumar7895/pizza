export type ProductVariantItem = {
  label: string;
  price: number;
};

export type ProductDTO = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  /** Pizza sizes / types — agar khali hai to sirf `price` use hota hai */
  variants?: ProductVariantItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "pending" | "accepted" | "rejected" | "delivered";

export type OrderItemDTO = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type OrderDTO = {
  _id: string;
  items: OrderItemDTO[];
  totalAmount: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryDTO = {
  _id: string;
  name: string;
  sortOrder: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CartLine = {
  /** Unique per cart row (product + variant label) */
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isVeg?: boolean;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
};
