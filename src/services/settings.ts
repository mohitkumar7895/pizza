import { http } from "./http";

export type SiteSettingsDTO = {
  heroImages: [string, string, string];
};

function triplet(raw: string[] | undefined): [string, string, string] {
  const a = raw?.[0] ?? "";
  const b = raw?.[1] ?? "";
  const c = raw?.[2] ?? "";
  return [a, b, c];
}

export async function fetchSettings(): Promise<SiteSettingsDTO> {
  const { data } = await http.get<{ heroImages?: string[] }>("/api/settings");
  return { heroImages: triplet(data.heroImages) };
}

export async function updateSettings(
  heroImages: [string, string, string]
): Promise<SiteSettingsDTO> {
  const { data } = await http.put<{ heroImages?: string[] }>("/api/settings", {
    heroImages,
  });
  return { heroImages: triplet(data.heroImages) };
}
