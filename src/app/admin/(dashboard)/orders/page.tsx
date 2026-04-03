"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { fetchOrdersAdmin, updateOrderStatus, deleteOrder } from "@/services/orders";
import type { OrderDTO, OrderStatus } from "@/types";

const statuses: OrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "delivered",
];

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  delivered: "Delivered",
};

function stepperDots(status: OrderStatus) {
  const rejected = status === "rejected";
  if (rejected) {
    return { a: false, b: false, c: false };
  }
  if (status === "pending") {
    return { a: true, b: false, c: false };
  }
  if (status === "accepted") {
    return { a: true, b: true, c: false };
  }
  return { a: true, b: true, c: true };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      setOrders(await fetchOrdersAdmin());
    } catch {
      setMsg("Unauthorized — sign in again at /admin/login.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      load();
    } catch {
      setMsg("Update failed.");
    }
  };

  const onDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      setMsg(null);
      await deleteOrder(id);
      setMsg("Order deleted successfully.");
      load();
    } catch {
      setMsg("Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-600">
          Update status — customers see the same steps on their order tracking
          page (Placed → Preparing → Completed).
        </p>
      </div>
      {msg && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">{msg}</div>
      )}
      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => {
            const dots = stepperDots(o.status);
            const displayId = o.orderNumber
              ? `#${o.orderNumber}`
              : `#${o._id.slice(-8).toUpperCase()}`;
            return (
              <article
                key={o._id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_28px_-12px_rgba(0,0,0,0.08)]"
              >
                <div className="border-b border-neutral-100 bg-[#faf8f5] px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-extrabold text-[#e60000]">
                        {displayId}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <p className="text-xl font-extrabold tabular-nums text-[#e60000]">
                      ₹ {o.totalAmount}
                    </p>
                  </div>
                  {(o.customerName || o.customerPhone || o.customerAddress) && (
                    <div className="mt-3 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 text-sm">
                      {o.customerName && (
                        <p>
                          <span className="font-semibold text-neutral-500">
                            Name:{" "}
                          </span>
                          {o.customerName}
                        </p>
                      )}
                      {o.customerPhone && (
                        <p className="mt-1">
                          <span className="font-semibold text-neutral-500">
                            Mobile:{" "}
                          </span>
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="text-[#e60000] underline-offset-2 hover:underline"
                          >
                            {o.customerPhone}
                          </a>
                        </p>
                      )}
                      {o.customerAddress && (
                        <p className="mt-1 text-neutral-700">
                          <span className="font-semibold text-neutral-500">
                            Address:{" "}
                          </span>
                          {o.customerAddress}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    Progress (customer view)
                  </p>
                  <div className="mt-3 flex max-w-md items-center justify-between gap-2">
                    {[
                      { key: "a", label: "Placed", on: dots.a },
                      { key: "b", label: "Preparing", on: dots.b },
                      { key: "c", label: "Completed", on: dots.c },
                    ].map((s, i) => (
                      <div
                        key={s.key}
                        className="flex flex-1 flex-col items-center gap-1.5 text-center"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                            s.on
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-neutral-200 bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {s.on ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-neutral-600">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="space-y-2 border-t border-neutral-100 px-5 py-4 text-sm">
                  {o.items.map((it, i) => (
                    <li
                      key={`${it.productId}-${i}`}
                      className="flex justify-between gap-2"
                    >
                      <span>
                        {it.name}{" "}
                        <span className="text-neutral-500">×{it.quantity}</span>
                      </span>
                      <span className="tabular-nums text-neutral-700">
                        ₹ {it.price * it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 border-t border-neutral-100 bg-neutral-50/80 px-5 py-4">
                  <span
                    className={`mr-auto rounded-full px-3 py-1 text-xs font-bold ${
                      o.status === "pending"
                        ? "bg-amber-100 text-amber-900"
                        : o.status === "accepted"
                          ? "bg-sky-100 text-sky-900"
                          : o.status === "delivered"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-red-100 text-red-900"
                    }`}
                  >
                    {labels[o.status]}
                  </span>
                  {statuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={o.status === s}
                      onClick={() => onStatus(o._id, s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                        s === "rejected"
                          ? "border border-red-200 bg-red-50 text-red-800"
                          : "border border-neutral-200 bg-white text-neutral-800 hover:bg-[#fdf6e8]"
                      }`}
                    >
                      {labels[s]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onDelete(o._id, displayId)}
                    className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100"
                    title="Delete order"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
          {orders.length === 0 && !msg && (
            <p className="text-neutral-500">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
