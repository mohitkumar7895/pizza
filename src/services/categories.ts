import type { CategoryDTO } from "@/types";
import { http } from "./http";
import { getCache, setCache } from "@/lib/cache";

export async function fetchCategories(): Promise<CategoryDTO[]> {
  const cacheKey = 'categories';
  const cached = getCache<CategoryDTO[]>(cacheKey);
  if (cached) return cached;
  
  const { data } = await http.get<CategoryDTO[]>("/api/categories");
  setCache(cacheKey, data, 120); // Cache for 120 seconds
  return data;
}

export async function createCategory(body: {
  name: string;
  sortOrder?: number;
  image?: string;
}): Promise<CategoryDTO> {
  const { data } = await http.post<CategoryDTO>("/api/categories", body);
  return data;
}

export async function updateCategory(
  id: string,
  body: Partial<CategoryDTO>
): Promise<CategoryDTO> {
  const { data } = await http.put<CategoryDTO>(`/api/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await http.delete(`/api/categories/${id}`);
}
