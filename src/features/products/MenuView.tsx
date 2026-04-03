"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategorySection } from "@/components/common/CategorySection";
import { ProductCard } from "@/components/cards/ProductCard";
import { AddToCartModal } from "@/components/modals/AddToCartModal";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { ScrollToTop } from "@/components/buttons/ScrollToTop";
import { fetchProducts } from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { fetchSettings } from "@/services/settings";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { placeOrder } from "@/services/orders";
import { MIN_ORDER_AMOUNT } from "@/lib/order-constants";
import { MinimumOrderModal } from "@/components/modals/MinimumOrderModal";
import { CheckoutDetailsModal } from "@/components/modals/CheckoutDetailsModal";
import { OrderConfirmationModal } from "@/components/modals/OrderConfirmationModal";
import type { CategoryDTO, ProductDTO } from "@/types";
import { useCart } from "@/features/cart/cart-context";
import { useScrollToSection } from "@/hooks/useScrollToSection";

function slugify(name: string) {
  return name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "cat";
}

export function MenuView() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [modalProduct, setModalProduct] = useState<ProductDTO | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [minOrderModalOpen, setMinOrderModalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [dishSearch, setDishSearch] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  } | null>(null);
  const router = useRouter();
  const { lines, clear, subtotal } = useCart();
  const scrollToSection = useScrollToSection();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, s] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSettings(),
      ]);
      setProducts(p);
      setCategories(c);
      setHeroImages(s.heroImages);
    } catch {
      setError("Could not load menu. Check MongoDB connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const orderIndex = useMemo(() => {
    const m = new Map<string, number>();
    categories.forEach((c) => m.set(c.name, c.sortOrder));
    return m;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = dishSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q),
    );
  }, [products, dishSearch]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProductDTO[]>();
    for (const pr of filteredProducts) {
      const c = pr.category?.trim() || "Other";
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(pr);
    }
    return [...map.entries()].sort((a, b) => {
      const ao = orderIndex.get(a[0]) ?? 500 + a[0].charCodeAt(0);
      const bo = orderIndex.get(b[0]) ?? 500 + b[0].charCodeAt(0);
      if (ao !== bo) return ao - bo;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredProducts, orderIndex]);

  const filterItems = useMemo(() => {
    const fromDb = categories.map((c) => {
      const count = products.filter((p) => p.category === c.name).length;
      return {
        id: slugify(c.name),
        name: c.name,
        count,
        image: c.image,
      };
    });
    if (fromDb.length) return fromDb;
    return grouped.map(([name, items]) => ({
      id: slugify(name),
      name,
      count: items.length,
      image: "",
    }));
  }, [categories, products, grouped]);

  const handleRequestCheckout = () => {
    if (!lines.length) return;
    if (subtotal < MIN_ORDER_AMOUNT) {
      setMinOrderModalOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleOrderNowFromEmptyCart = () => {
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckoutSubmit = async (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }) => {
    const items = lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      quantity: l.quantity,
      price: l.price,
    }));
    const order = await placeOrder({ items, ...data });
    const id = order.orderNumber;
    clear();
    setCartOpen(false);
    setCheckoutOpen(false);
    if (id) {
      setConfirmationData({
        orderNumber: id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
      });
      setConfirmationOpen(true);
      
      // Auto redirect after 4 seconds
      setTimeout(() => {
        router.push(`/order/${encodeURIComponent(id)}`);
      }, 4000);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="relative flex flex-col bg-[#faf8f5]">
      <Navbar onCartClick={() => setCartOpen(true)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pt-0 pb-4 sm:px-6 sm:pb-6 sm:pt-3 md:pt-4">
        <HeroBanner images={heroImages} />

        <div className="mb-2 md:hidden">
          <label htmlFor="dish-search" className="sr-only">
            Search for dishes
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#b91c1c]/50"
              aria-hidden
            />
            <input
              id="dish-search"
              type="search"
              autoComplete="off"
              placeholder="Search for dishes…"
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
              className="font-body w-full rounded-xl border border-white/90 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] outline-none ring-[#e60000]/20 placeholder:text-neutral-400 focus:border-[#e60000]/35 focus:ring-2"
            />
          </div>
        </div>

        <div className="mb-3 -mx-1 overflow-x-auto pb-0.5 sm:mb-4 scrollbar-hide">
          <div className="flex min-w-min gap-1.5 px-0.5 sm:gap-2.5 sm:px-1">
            {filterItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="flex min-w-40 max-w-52 shrink-0 items-center gap-1.5 rounded-lg border border-white/80 bg-white px-2 py-1.5 text-left shadow-[0_5px_20px_-10px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_-10px_rgba(230,0,0,0.16)] sm:min-w-48 sm:max-w-56 sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2"
              >
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#fdf6e8] ring-2 ring-[#e60000]/15 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  {item.image ? (
                    <Image
                      src={item.image.startsWith("http") ? item.image : item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized={item.image.startsWith("http")}
                    />
                  ) : (
                    <Image
                      src="/placeholder-food.svg"
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="font-body text-[11px] font-extrabold uppercase leading-tight text-[#b91c1c] sm:text-xs">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="py-20 text-center text-red-600">{error}</p>
        )}

        {!loading && !error && grouped.length === 0 && dishSearch.trim() && (
          <p className="py-12 text-center font-body text-sm text-neutral-500">
            No dishes match &ldquo;{dishSearch.trim()}&rdquo;. Try another name.
          </p>
        )}

        {!loading && !error && grouped.length > 0 && (
          <div className="flex flex-col gap-5 sm:gap-7 md:gap-9">
            {grouped.map(([name, items]) => (
              <CategorySection
                key={name}
                id={slugify(name)}
                title={`${name.toUpperCase()} (${items.length})`}
              >
                {items.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onAdd={() => setModalProduct(p)}
                  />
                ))}
              </CategorySection>
            ))}
          </div>
        )}
      </main>

      <Footer isLoading={loading} />

      <ScrollToTop />

      <AddToCartModal
        key={modalProduct ? modalProduct._id : "closed"}
        open={!!modalProduct}
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRequestCheckout={handleRequestCheckout}
        onOrderNow={handleOrderNowFromEmptyCart}
      />

      <MinimumOrderModal
        open={minOrderModalOpen}
        onClose={() => setMinOrderModalOpen(false)}
        onAddItem={() => {
          setCartOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <CheckoutDetailsModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />
      
      {confirmationData && (
        <OrderConfirmationModal
          open={confirmationOpen}
          orderNumber={confirmationData.orderNumber}
          customerName={confirmationData.customerName}
          customerPhone={confirmationData.customerPhone}
          customerAddress={confirmationData.customerAddress}
          onClose={() => {
            setConfirmationOpen(false);
            router.push(`/order/${encodeURIComponent(confirmationData.orderNumber)}`);
          }}
        />
      )}
    </div>
  );
}
