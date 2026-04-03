import axios from "axios";
import type { ProductDTO } from "@/types";
import { http } from "./http";
import { getCache, setCache } from "@/lib/cache";

export async function fetchProducts(category?: string): Promise<ProductDTO[]> {
  const cacheKey = `products_${category || 'all'}`;
  const cached = getCache<ProductDTO[]>(cacheKey);
  if (cached) return cached;
  
  const { data } = await http.get<ProductDTO[]>("/api/products", {
    params: category ? { category } : undefined,
  });
  setCache(cacheKey, data, 60); // Cache for 60 seconds
  return data;
}

export async function createProduct(
  body: Partial<ProductDTO>
): Promise<ProductDTO> {
  const { data } = await http.post<ProductDTO>("/api/products", body);
  return data;
}

export async function updateProduct(
  id: string,
  body: Partial<ProductDTO>
): Promise<ProductDTO> {
  const { data } = await http.put<ProductDTO>(`/api/products/${id}`, body);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/api/products/${id}`);
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await axios.post<{ url: string }>("/api/upload", fd, {
    withCredentials: true,
  });
  return data.url;
}
