import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { NavbarSettings } from "@/lib/models/NavbarSettings";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

const KEY = "main";

function str(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

export type NavbarPublicDTO = {
  logoUrl: string;
  brand: string;
  tagline: string;
  phone: string;
};

function fromDoc(doc: {
  logoUrl?: string | null;
  brand?: string | null;
  tagline?: string | null;
  phone?: string | null;
} | null): NavbarPublicDTO {
  return {
    logoUrl: (doc?.logoUrl ?? "").trim(),
    brand: (doc?.brand ?? "").trim(),
    tagline: (doc?.tagline ?? "").trim(),
    phone: (doc?.phone ?? "").trim(),
  };
}

/** Copy legacy navbar fields from SiteSettings into NavbarSettings once. */
async function migrateIfNeeded(): Promise<void> {
  const nav = await NavbarSettings.findOne({ key: KEY }).lean();
  const hasAny =
    nav &&
    (str(nav.logoUrl) ||
      str(nav.brand) ||
      str(nav.tagline) ||
      str(nav.phone));
  if (hasAny) return;

  const site = await SiteSettings.findOne({ key: KEY }).lean();
  if (!site) return;

  const legacy = site as {
    navbarLogo?: string | null;
    navbarBrand?: string | null;
    navbarTagline?: string | null;
    restaurantPhone?: string | null;
  };

  const logoUrl = str(legacy.navbarLogo);
  const brand = str(legacy.navbarBrand);
  const tagline =
    legacy.navbarTagline === undefined || legacy.navbarTagline === null
      ? ""
      : String(legacy.navbarTagline).trim();
  const phone = str(legacy.restaurantPhone);

  if (!logoUrl && !brand && !tagline && !phone) return;

  await NavbarSettings.findOneAndUpdate(
    { key: KEY },
    { $set: { logoUrl, brand, tagline, phone } },
    { upsert: true, new: true, runValidators: true }
  );
  await SiteSettings.updateOne(
    { key: KEY },
    { $unset: { navbarLogo: "", navbarBrand: "", navbarTagline: "" } }
  );
}

export async function GET() {
  try {
    await connectDB();
    await migrateIfNeeded();
    const doc = await NavbarSettings.findOne({ key: KEY }).lean();
    const response = NextResponse.json(fromDoc(doc));
    response.headers.set(
      "Cache-Control",
      "private, no-store, must-revalidate"
    );
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        logoUrl: "",
        brand: "",
        tagline: "",
        phone: "",
        error: "navbar_unavailable",
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = await request.json();
    const logoUrl = str(body.logoUrl);
    const brand = str(body.brand);
    const tagline =
      body.tagline === undefined || body.tagline === null
        ? ""
        : String(body.tagline).trim();
    const phone = str(body.phone);

    await NavbarSettings.findOneAndUpdate(
      { key: KEY },
      { $set: { logoUrl, brand, tagline, phone } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({
      ok: true,
      logoUrl,
      brand,
      tagline,
      phone,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save navbar" }, { status: 500 });
  }
}
