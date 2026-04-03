"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProducts } from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { fetchOrdersAdmin } from "@/services/orders";

export default function AdminHomePage() {
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pending: 0,
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        let o: Awaited<ReturnType<typeof fetchOrdersAdmin>> = [];
        try {
          o = await fetchOrdersAdmin();
        } catch {
          setErr("Could not load orders. Sign in again if your session expired.");
        }
        setCounts({
          products: p.length,
          categories: c.length,
          orders: o.length,
          pending: o.filter((x) => x.status === "pending").length,
        });
      } catch {
        setErr("Could not load data. Check MongoDB and network.");
      }
    })();
  }, []);

  const cards = [
    { label: "Products", value: counts.products, href: "/admin/products" },
    {
      label: "Categories",
      value: counts.categories,
      href: "/admin/categories",
    },
    { label: "Orders", value: counts.orders, href: "/admin/orders" },
    {
      label: "Pending orders",
      value: counts.pending,
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Manage catalogue and fulfil orders in one place.
      </p>
      {err && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {err}{" "}
          <Link href="/admin/login" className="font-semibold underline">
            Login
          </Link>
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-neutral-500">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#e60000]">
              {c.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
