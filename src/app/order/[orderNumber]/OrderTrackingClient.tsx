"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Download, Check, Clock, Loader2 } from "lucide-react";
import { fetchOrderByNumber } from "@/services/orders";
import {
  fetchSettings,
  type SiteSettingsDTO,
} from "@/services/settings";
import type { OrderDTO, OrderStatus, ProductDTO } from "@/types";
import { ScrollToTop } from "@/components/buttons/ScrollToTop";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

function getEstimatedMinutes(status: OrderStatus): number {
  if (status === "rejected") return 0;
  if (status === "pending") return 15;
  if (status === "accepted") return 10;
  return 5; // completed
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    if (loading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErr(null);
    try {
      const o = await fetchOrderByNumber(orderNumber);
      setOrder(o);
    } catch {
      setErr("We couldn't find this order.");
      setOrder(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderNumber, loading]);

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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#faf8f5] font-body">
        <Loader2 className="h-8 w-8 animate-spin text-[#e60000]" />
        <p className="text-neutral-600">Loading your order…</p>
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
    <div className="flex flex-col min-h-dvh bg-[#faf8f5] font-body">
      {/* Navbar */}
      <Navbar />

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e60000]/10 to-transparent px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-[#e60000]" />
          <p className="text-xs font-semibold text-[#e60000]">Updating order status...</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-[#e60000]">
                    {displayId}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Date {formatWhen(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wide">Estimated time</p>
                  </div>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                    {getEstimatedMinutes(order.status)} minute
                  </p>
                </div>
              </div>

              {rejected ? (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  This order could not be accepted. Please call us if you were
                  charged.
                </p>
              ) : (
                <div className="relative mt-8">
                  <div className="flex items-start gap-2">
                    {steps.map((st, i) => (
                      <div key={st.id} className="flex flex-1 flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
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
                          className={`mt-3 text-center text-xs font-bold uppercase tracking-wide ${
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
                  
                  {/* Connect line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200 -z-10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${steps.filter((s) => s.done).length * 33.33 - 16.67}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-neutral-100 pt-5">
                <p className="text-sm font-bold text-neutral-900">
                  Restaurant Address:
                </p>
                <p className="mt-2 text-sm text-neutral-600">{address}</p>
                <p className="mt-4 text-sm font-medium text-neutral-700">
                  To know your order status call now
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#e60000] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 transition-shadow"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <a
                    href={waLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/40 transition-shadow"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Whatsapp
                  </a>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-body text-sm font-bold text-neutral-900">
                Restaurant Instruction
              </h3>
              
              <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto]">
                {/* Left side: Instructions and customer details */}
                <div>
                  {(order.customerName || order.customerAddress) && (
                    <div className="rounded-xl bg-[#faf8f5] px-4 py-3 text-sm text-neutral-800 mb-4">
                      {order.customerName ? (
                        <p className="font-semibold">{order.customerName}</p>
                      ) : null}
                      {order.customerAddress ? (
                        <p className="mt-1 text-xs text-neutral-600">
                          {order.customerAddress}
                        </p>
                      ) : null}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {instruction}
                  </p>
                </div>
                
                {/* Right side: QR Code */}
                {qrUrl ? (
                  <div className="flex flex-col items-center gap-2 sm:border-l sm:border-neutral-100 sm:pl-5">
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                      <Image
                        src={qrUrl}
                        alt="Payment QR"
                        fill
                        className="object-contain p-1.5"
                        unoptimized={qrUnopt}
                      />
                    </div>
                    <a
                      href={qrUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                      aria-label="Download QR"
                      title="Download QR Code"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] sm:p-6">
              <h3 className="font-body text-sm font-bold text-neutral-900">
                Order Items
              </h3>
              <ul className="mt-4 space-y-4 divide-y divide-neutral-100">
                {order.items.map((it, i) => {
                  const pic = productById.get(it.productId)?.image;
                  const src = imgSrc(pic);
                  const unopt = src.startsWith("http");
                  return (
                    <li key={`${it.productId}-${i}`} className="flex gap-3 pt-4 first:pt-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={unopt}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-neutral-900">
                          {it.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Quantity: {it.quantity} Pcs
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-neutral-900 whitespace-nowrap">
                        ₹ {it.price * it.quantity}
                      </p>
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-5 space-y-2 border-t border-neutral-200 pt-5">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Sub Total:</span>
                  <span className="tabular-nums font-semibold">₹ {order.totalAmount}</span>
                </div>
                <div className="flex justify-between font-body text-base font-extrabold text-neutral-900 border-t border-neutral-100 pt-3 mt-3">
                  <span>Total Amount:</span>
                  <span className="tabular-nums text-[#e60000]">
                    ₹ {order.totalAmount}
                  </span>
                </div>
              </div>
              
              <Link
                href="/"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#e60000] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40 transition-shadow"
              >
                Back To Menu
              </Link>
            </div>
          </aside>
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      
      <ScrollToTop />
    </div>
  );
}
