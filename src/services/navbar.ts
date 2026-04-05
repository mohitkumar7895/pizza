import { http } from "./http";

export type NavbarDTO = {
  logoUrl: string;
  brand: string;
  tagline: string;
  phone: string;
};

function normalize(data: Record<string, unknown>): NavbarDTO {
  return {
    logoUrl: String(data.logoUrl ?? "").trim(),
    brand: String(data.brand ?? "").trim(),
    tagline: String(data.tagline ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
  };
}

export async function fetchNavbar(): Promise<NavbarDTO> {
  const { data } = await http.get<Record<string, unknown>>("/api/navbar", {
    headers: { "Cache-Control": "no-cache" },
  });
  return normalize(data);
}

export async function updateNavbar(payload: NavbarDTO): Promise<NavbarDTO> {
  const { data } = await http.put<Record<string, unknown>>("/api/navbar", {
    logoUrl: payload.logoUrl,
    brand: payload.brand,
    tagline: payload.tagline,
    phone: payload.phone,
  });
  return normalize(data);
}
