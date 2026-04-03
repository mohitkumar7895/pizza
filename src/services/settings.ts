import { http } from "./http";
import { getCache, setCache } from "@/lib/cache";

export type SiteSettingsDTO = {
  heroImages: [string, string, string];
  restaurantAddress: string;
  restaurantInstruction: string;
  restaurantPhone: string;
  paymentQrImage: string;
};

function triplet(raw: string[] | undefined): [string, string, string] {
  const a = raw?.[0] ?? "";
  const b = raw?.[1] ?? "";
  const c = raw?.[2] ?? "";
  return [a, b, c];
}

function normalizeResponse(data: Record<string, unknown>): SiteSettingsDTO {
  return {
    heroImages: triplet(data.heroImages as string[] | undefined),
    restaurantAddress: String(data.restaurantAddress ?? "").trim(),
    restaurantInstruction: String(data.restaurantInstruction ?? "").trim(),
    restaurantPhone: String(data.restaurantPhone ?? "").trim(),
    paymentQrImage: String(data.paymentQrImage ?? "").trim(),
  };
}

export async function fetchSettings(): Promise<SiteSettingsDTO> {
  const cacheKey = 'settings';
  const cached = getCache<SiteSettingsDTO>(cacheKey);
  if (cached) return cached;
  
  const { data } = await http.get<Record<string, unknown>>("/api/settings");
  const normalized = normalizeResponse(data);
  setCache(cacheKey, normalized, 60); // Cache for 60 seconds
  return normalized;
}

export async function updateSettings(
  payload: SiteSettingsDTO
): Promise<SiteSettingsDTO> {
  const { data } = await http.put<Record<string, unknown>>("/api/settings", {
    heroImages: payload.heroImages,
    restaurantAddress: payload.restaurantAddress,
    restaurantInstruction: payload.restaurantInstruction,
    restaurantPhone: payload.restaurantPhone,
    paymentQrImage: payload.paymentQrImage,
  });
  return normalizeResponse(data);
}
