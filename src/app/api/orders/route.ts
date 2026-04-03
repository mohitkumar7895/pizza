import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { adminJsonResponse, isAdminSession } from "@/lib/admin-auth";
import type { OrderDTO, OrderItemDTO } from "@/types";

function toDTO(doc: {
  _id: { toString: () => string };
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
    items: doc.items.map(
      (i): OrderItemDTO => ({
        productId: i.productId.toString(),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })
    ),
    totalAmount: doc.totalAmount,
    status: doc.status as OrderDTO["status"],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function GET() {
  if (!(await isAdminSession())) {
    return adminJsonResponse("Unauthorized");
  }
  try {
    await connectDB();
    const docs = await Order.find().sort({ createdAt: -1 }).lean();
    const orders = docs.map((d) =>
      toDTO({
        _id: d._id as mongoose.Types.ObjectId,
        items: d.items.map((i) => ({
          ...i,
          productId: i.productId as mongoose.Types.ObjectId,
        })),
        totalAmount: d.totalAmount,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })
    );
    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { items } = body as {
      items?: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }>;
    };
    if (!items?.length) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }
    for (const it of items) {
      if (!mongoose.Types.ObjectId.isValid(it.productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
      }
    }
    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const doc = await Order.create({
      items: items.map((i) => ({
        productId: new mongoose.Types.ObjectId(i.productId),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount,
      status: "pending",
    });
    return NextResponse.json(toDTO(doc), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
