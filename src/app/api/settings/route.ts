import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";

const KEY = "main";

function normalizeHeroImages(raw: unknown): [string, string, string] {
  const arr = Array.isArray(raw) ? raw : [];
  const urls = arr
    .slice(0, 3)
    .map((x) => (typeof x === "string" ? x.trim() : ""));
  while (urls.length < 3) urls.push("");
  return [urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""];
}

export async function GET() {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: KEY }).lean();
    const heroImages = doc?.heroImages?.length
      ? normalizeHeroImages(doc.heroImages)
      : ["", "", ""];
    return NextResponse.json({ heroImages });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { heroImages: ["", "", ""], error: "settings_unavailable" },
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
    const heroImages = normalizeHeroImages(body.heroImages);
    await SiteSettings.findOneAndUpdate(
      { key: KEY },
      { $set: { heroImages } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ ok: true, heroImages });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
