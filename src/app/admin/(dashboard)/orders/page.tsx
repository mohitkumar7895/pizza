"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrdersAdmin, updateOrderStatus } from "@/services/orders";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-neutral-600">
          Accept, reject, or mark delivered. Customers see success after placing
          only.
        </p>
      </div>
      {msg && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">{msg}</div>
      )}
      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article
              key={o._id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Order #{o._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-neutral-500">Total</p>
                  <p className="text-xl font-extrabold text-[#e60000]">
                    ₹ {o.totalAmount}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
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
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
                {o.items.map((it, i) => (
                  <li
                    key={`${it.productId}-${i}`}
                    className="flex justify-between gap-2"
                  >
                    <span>
                      {it.name}{" "}
                      <span className="text-neutral-500">
                        ×{it.quantity}
                      </span>
                    </span>
                    <span className="tabular-nums text-neutral-700">
                      ₹ {it.price * it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={o.status === s}
                    onClick={() => onStatus(o._id, s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                      s === "rejected"
                        ? "border border-red-200 bg-red-50 text-red-800"
                        : "border border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-[#fdf6e8]"
                    }`}
                  >
                    {labels[s]}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {orders.length === 0 && !msg && (
            <p className="text-neutral-500">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
