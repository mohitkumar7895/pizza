import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import type { OrderDTO, OrderItemDTO } from "@/types";

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

type Params = { params: Promise<{ orderNumber: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { orderNumber: raw } = await params;
    const orderNumber = decodeURIComponent(raw ?? "").trim();
    if (!orderNumber) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }
    await connectDB();
    const doc = await Order.findOne({ orderNumber }).lean();
    if (!doc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const d = doc as {
      _id: mongoose.Types.ObjectId;
      orderNumber?: string;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      items: Array<{
        productId: mongoose.Types.ObjectId;
        name: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      status: string;
      createdAt?: Date;
      updatedAt?: Date;
    };
    return NextResponse.json(
      toDTO({
        _id: d._id,
        orderNumber: d.orderNumber,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        customerAddress: d.customerAddress,
        items: d.items.map((i) => ({
          ...i,
          productId: i.productId,
        })),
        totalAmount: d.totalAmount,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
