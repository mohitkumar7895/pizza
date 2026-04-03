import { NextResponse } from "next/server";

const UA =
  "AdPizzaHub/1.0 (restaurant ordering; contact via site admin)";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get("lat") ?? "");
    const lon = Number.parseFloat(searchParams.get("lon") ?? "");
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", "en,hi");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": UA },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Address lookup failed" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { display_name?: string };
    const address =
      typeof data.display_name === "string" ? data.display_name.trim() : "";

    return NextResponse.json({ address: address || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Address lookup failed" },
      { status: 500 }
    );
  }
}
