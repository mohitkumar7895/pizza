"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Download, Check } from "lucide-react";
import { fetchOrderByNumber } from "@/services/orders";
import {
  fetchSettings,
  type SiteSettingsDTO,
} from "@/services/settings";
import type { OrderDTO, OrderStatus, ProductDTO } from "@/types";
import { ScrollToTop } from "@/components/buttons/ScrollToTop";
import { fetchProducts } from "@/services/products";

const ENV_PHONE =
  process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "+919999999999";
const ENV_ADDRESS =
  process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ??
  "Ad Pizza Hub — your local outlet";
const ENV_INSTRUCTION =
  process.env.NEXT_PUBLIC_RESTAURANT_INSTRUCTION ??
  "Thank you for ordering with us. For changes, call the restaurant.";

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function waLink(phone: string) {
  const d = digitsOnly(phone);
  const n = d.length >= 10 ? d.slice(-10) : d;
  return `https://wa.me/91${n}`;
}

function formatWhen(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Step = { id: string; label: string; done: boolean; current: boolean };

/** Matches admin “Progress (customer view)” mapping */
function stepsForStatus(status: OrderStatus): Step[] {
  const rejected = status === "rejected";
  if (rejected) {
    return [
      { id: "p", label: "Placed", done: false, current: false },
      { id: "c", label: "Preparing", done: false, current: false },
      { id: "d", label: "Completed", done: false, current: false },
    ];
  }
  if (status === "pending") {
    return [
      { id: "p", label: "Placed", done: true, current: false },
      { id: "c", label: "Preparing", done: false, current: true },
      { id: "d", label: "Completed", done: false, current: false },
    ];
  }
  if (status === "accepted") {
    return [
      { id: "p", label: "Placed", done: true, current: false },
      { id: "c", label: "Preparing", done: true, current: false },
      { id: "d", label: "Completed", done: false, current: true },
    ];
  }
  return [
    { id: "p", label: "Placed", done: true, current: false },
    { id: "c", label: "Preparing", done: true, current: false },
    { id: "d", label: "Completed", done: true, current: true },
  ];
}

function imgSrc(url?: string) {
  if (!url) return "/placeholder-food.svg";
  if (url.startsWith("http")) return url;
  return url;
}

export function OrderTrackingClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productById, setProductById] = useState<Map<string, ProductDTO>>(
    () => new Map(),
  );

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const o = await fetchOrderByNumber(orderNumber);
      setOrder(o);
    } catch {
      setErr("We couldn’t find this order.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    loadOrder();
    const t = setInterval(loadOrder, 25_000);
    return () => clearInterval(t);
  }, [loadOrder]);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        const m = new Map<string, ProductDTO>();
        for (const p of list) m.set(p._id, p);
        setProductById(m);
      })
      .catch(() => {
        if (!cancelled) setProductById(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !order) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#faf8f5] font-body text-neutral-600">
        Loading your order…
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#faf8f5] px-4 text-center">
        <p className="font-body text-neutral-700">{err ?? "Not found."}</p>
        <Link
          href="/"
          className="rounded-full bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  const displayId = order.orderNumber
    ? `#${order.orderNumber}`
    : `#${order._id.slice(-8).toUpperCase()}`;
  const steps = stepsForStatus(order.status);
  const rejected = order.status === "rejected";

  const phone =
    settings?.restaurantPhone?.trim() || ENV_PHONE;
  const address =
    settings?.restaurantAddress?.trim() || ENV_ADDRESS;
  const instruction =
    settings?.restaurantInstruction?.trim() || ENV_INSTRUCTION;
  const qrUrl = settings?.paymentQrImage?.trim() ?? "";
  const qrUnopt =
    qrUrl.startsWith("http") ||
    qrUrl.startsWith("//") ||
    qrUrl.startsWith("/uploads");

  return (
    <div className="min-h-dvh bg-[#faf8f5] pb-16 pt-8 font-body">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] sm:p-6">
              <p className="text-center text-sm font-semibold text-emerald-600">
                {rejected ? "—" : "Estimated time 40 minute"}
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-[#e60000]">
                    {displayId}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Date: {formatWhen(order.createdAt)}
                  </p>
                </div>
              </div>

              {rejected ? (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  This order could not be accepted. Please call us if you were
                  charged.
                </p>
              ) : (
                <div className="relative mt-8 flex items-start justify-between gap-1 px-1 sm:gap-2">
                  {steps.map((st, i) => (
                    <div
                      key={st.id}
                      className="relative flex flex-1 flex-col items-center text-center"
                    >
                      {st.id === "c" &&
                      (st.current || order.status === "accepted") ? (
                        <span
                          className="absolute -top-6 text-lg leading-none"
                          aria-hidden
                        >
                          🎉
                        </span>
                      ) : null}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          st.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : st.current
                              ? "border-[#e60000] bg-white text-[#e60000]"
                              : "border-neutral-200 bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {st.done ? <Check className="h-5 w-5" /> : i + 1}
                      </div>
                      <p
                        className={`mt-2 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
                          st.current || st.done
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        {st.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <p className="text-sm font-bold text-neutral-900">
                  Restaurant address:
                </p>
                <p className="mt-1 text-sm text-neutral-600">{address}</p>
                <p className="mt-4 text-sm text-neutral-700">
                  To know your order status call now
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#e60000] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <a
                    href={waLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Whatsapp
                  </a>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-body text-sm font-bold text-neutral-900">
                Restaurant instruction
              </h3>
              {(order.customerName || order.customerAddress) && (
                <div className="mt-2 rounded-xl bg-[#faf8f5] px-3 py-2 text-sm text-neutral-800">
                  {order.customerName ? (
                    <p className="font-semibold">{order.customerName}</p>
                  ) : null}
                  {order.customerAddress ? (
                    <p className="mt-1 text-neutral-600">
                      {order.customerAddress}
                    </p>
                  ) : null}
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {instruction}
              </p>
              {qrUrl ? (
                <div className="mt-4 flex flex-wrap items-start gap-4 border-t border-neutral-100 pt-4">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <Image
                      src={qrUrl}
                      alt="Payment QR"
                      fill
                      className="object-contain p-2"
                      unoptimized={qrUnopt}
                    />
                  </div>
                  <a
                    href={qrUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                    aria-label="Download QR"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              ) : null}
            </article>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
              <h3 className="font-body text-sm font-bold text-neutral-900">
                Order summary
              </h3>
              <ul className="mt-4 space-y-4">
                {order.items.map((it, i) => {
                  const pic = productById.get(it.productId)?.image;
                  const src = imgSrc(pic);
                  const unopt = src.startsWith("http");
                  return (
                  <li key={`${it.productId}-${i}`} className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={unopt}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        {it.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Quantity: {it.quantity} Pcs
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-neutral-900">
                      ₹ {it.price * it.quantity}
                    </p>
                  </li>
                  );
                })}
              </ul>
              <div className="my-4 border-t border-neutral-200" />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Sub total</span>
                <span className="tabular-nums">₹ {order.totalAmount}</span>
              </div>
              <div className="mt-2 flex justify-between font-body text-base font-bold text-neutral-900">
                <span>Total Amount</span>
                <span className="tabular-nums text-[#e60000]">
                  ₹ {order.totalAmount}
                </span>
              </div>
              <Link
                href="/"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#e60000] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25"
              >
                Back To Menu
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
