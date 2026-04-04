import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import { categoryDocToDTO } from "@/lib/category-dto";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await connectDB();
    const body = await request.json();
    const existing = await Category.findById(id).lean();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const oldName = existing.name;

    const doc = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (doc.name !== oldName) {
      const oid = new mongoose.Types.ObjectId(id);
      // Every product linked to this category (by id) — works even if stored `category` text was wrong/stale
      await Product.updateMany(
        { categoryId: oid },
        { $set: { category: doc.name } }
      );
      // Legacy rows that only store the old name string (no categoryId)
      await Product.updateMany(
        { category: oldName },
        { $set: { category: doc.name } }
      );
    }

    // Link products that match this category’s name but still lack categoryId (fixes mixed / old data)
    await Product.updateMany(
      {
        category: doc.name,
        $or: [{ categoryId: null }, { categoryId: { $exists: false } }],
      },
      { $set: { categoryId: new mongoose.Types.ObjectId(id) } }
    );

    return NextResponse.json(categoryDocToDTO(doc));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await connectDB();
    const doc = await Category.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
