import type { CategoryDTO, ProductDTO } from "@/types";
import { http } from "./http";

export type MenuPayload = {
  categories: CategoryDTO[];
  products: ProductDTO[];
};

/**
 * One request = categories + products in sync. Cache-busted so browser/proxy never serves stale menu.
 */
export async function fetchMenu(): Promise<MenuPayload> {
  const { data } = await http.get<MenuPayload>("/api/menu", {
    params: { _t: Date.now() },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  return data;
}
