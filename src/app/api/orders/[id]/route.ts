import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import type { OrderDTO, OrderStatus } from "@/types";

function toDTO(doc: {
  _id: { toString: () => string };
  orderNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  items: Array<{
    productId: { toString: () => string };
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}): OrderDTO {
  return {
    _id: doc._id.toString(),
    orderNumber: doc.orderNumber ?? undefined,
    customerName: doc.customerName ?? undefined,
    customerPhone: doc.customerPhone ?? undefined,
    customerAddress: doc.customerAddress ?? undefined,
    items: doc.items.map((i) => ({
      productId: i.productId.toString(),
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount: doc.totalAmount,
    status: doc.status as OrderDTO["status"],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

const ALLOWED: OrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "delivered",
];

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
    const body = await request.json();
    const status = body.status as string | undefined;
    if (!status || !ALLOWED.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await connectDB();
    const doc = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toDTO(doc));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await connectDB();
    const result = await Order.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
