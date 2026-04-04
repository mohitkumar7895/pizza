import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { categoryDocToDTO } from "@/lib/category-dto";
import { toProductDTO } from "@/lib/product-dto";

/**
 * Single snapshot of categories + products (with category names resolved from Category docs).
 * Landing page uses this so chips + section headings always match one DB read.
 */
export async function GET() {
  try {
    await connectDB();
    const [catDocs, productDocs] = await Promise.all([
      Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
      Product.find()
        .populate({ path: "categoryId", select: "name" })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const categories = catDocs.map((d) =>
      categoryDocToDTO({ ...d, _id: d._id })
    );
    const products = productDocs.map((d) =>
      toProductDTO({
        ...d,
        _id: d._id,
        variants: d.variants as { label: string; price: number }[] | undefined,
      })
    );

    const res = NextResponse.json({ categories, products });
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
