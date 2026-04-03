import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import { toProductDTO } from "@/lib/product-dto";
import { sanitizeProductBody } from "@/lib/product-payload";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const filter = category ? { category } : {};
    const docs = await Product.find(filter).sort({ createdAt: 1 }).lean();
    const products = docs.map((d) =>
      toProductDTO({
        ...d,
        _id: d._id,
        variants: d.variants as { label: string; price: number }[] | undefined,
      })
    );
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = sanitizeProductBody(body);
    if (!parsed) {
      return NextResponse.json(
        { error: "name, category, and valid price (or types with prices) required" },
        { status: 400 }
      );
    }
    const doc = await Product.create(parsed);
    return NextResponse.json(toProductDTO(doc.toObject()), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
