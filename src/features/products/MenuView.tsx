"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { fetchMenu } from "@/services/menu";
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

/** Stable DOM id for scroll + section (rename-safe). */
function sectionDomId(categoryId: string) {
  return `cat-${categoryId}`;
}

function productInCategory(p: ProductDTO, c: CategoryDTO): boolean {
  if (p.categoryId) {
    return p.categoryId === c._id;
  }
  const a = p.category.trim().toLowerCase();
  const b = c.name.trim().toLowerCase();
  return a.length > 0 && a === b;
}

function sortCategories(list: CategoryDTO[]): CategoryDTO[] {
  return [...list].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      a.name.localeCompare(b.name)
  );
}

/** Min categories to enable seamless horizontal loop (circular scroll). */
const CATEGORY_STRIP_LOOP_MIN = 2;

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
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const categoryInnerRef = useRef<HTMLDivElement>(null);
  const categoryLoopJumpingRef = useRef(false);
  const categoryStripLoopRef = useRef(false);

  useEffect(() => {
    const el = categoryStripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const useX = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = useX ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const loop = categoryStripLoopRef.current;
      if (!loop && delta < 0 && el.scrollLeft <= 0) return;
      if (!loop && delta > 0 && el.scrollLeft >= max - 0.5) return;
      el.scrollLeft += delta;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menu, s] = await Promise.all([fetchMenu(), fetchSettings()]);
      setProducts(menu.products);
      setCategories(menu.categories);
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

  /** Refetch when user comes back from another tab (e.g. admin) so names always match DB */
  useEffect(() => {
    let wasHidden = false;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
      } else if (document.visibilityState === "visible" && wasHidden) {
        wasHidden = false;
        void load();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

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

  /**
   * Section titles + order come from admin Categories — not from stale product.category strings.
   */
  const orderedSections = useMemo(() => {
    type Section = {
      listKey: string;
      sectionId: string;
      /** Label for horizontal chips (no count). */
      chipLabel: string;
      title: string;
      items: ProductDTO[];
    };

    if (categories.length === 0) {
      const map = new Map<string, ProductDTO[]>();
      for (const pr of filteredProducts) {
        const key = pr.category?.trim() || "Other";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(pr);
      }
      return [...map.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, items]) => ({
          listKey: slugify(name) || name,
          sectionId: slugify(name),
          chipLabel: name,
          title: `${name.toUpperCase()} (${items.length})`,
          items,
        }));
    }

    const sorted = sortCategories(categories);
    const used = new Set<string>();
    const sections: Section[] = [];

    for (const c of sorted) {
      const items = filteredProducts.filter((p) => productInCategory(p, c));
      if (items.length === 0) continue;
      items.forEach((p) => used.add(p._id));
      sections.push({
        listKey: c._id,
        sectionId: sectionDomId(c._id),
        chipLabel: c.name,
        title: `${c.name.toUpperCase()} (${items.length})`,
        items,
      });
    }

    const orphan = filteredProducts.filter((p) => !used.has(p._id));
    if (orphan.length > 0) {
      const map = new Map<string, ProductDTO[]>();
      for (const pr of orphan) {
        const key = pr.category?.trim() || "Other";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(pr);
      }
      for (const [name, items] of [...map.entries()].sort((a, b) =>
        a[0].localeCompare(b[0])
      )) {
        const slug = slugify(name) || "other";
        sections.push({
          listKey: `orphan-${slug}-${items[0]?._id ?? name}`,
          sectionId: `orphan-${slug}-${items[0]?._id ?? "x"}`,
          chipLabel: name,
          title: `${name.toUpperCase()} (${items.length})`,
          items,
        });
      }
    }

    return sections;
  }, [categories, filteredProducts]);

  const filterItems = useMemo(() => {
    if (categories.length === 0) {
      return orderedSections.map((s) => ({
        listKey: s.listKey,
        id: s.sectionId,
        name: s.chipLabel,
        count: s.items.length,
        image: "",
      }));
    }
    return sortCategories(categories).map((c) => {
      const count = products.filter((p) => productInCategory(p, c)).length;
      return {
        listKey: c._id,
        id: sectionDomId(c._id),
        name: c.name,
        count,
        image: c.image,
      };
    });
  }, [categories, products, orderedSections]);

  const categoryStripModel = useMemo(() => {
    const items = filterItems;
    if (items.length < CATEGORY_STRIP_LOOP_MIN) {
      return { loop: false as const, items };
    }
    return {
      loop: true as const,
      items: [...items, ...items, ...items],
    };
  }, [filterItems]);

  useEffect(() => {
    categoryStripLoopRef.current = categoryStripModel.loop;
  }, [categoryStripModel.loop]);

  const jumpCategoryLoop = useCallback(() => {
    if (!categoryStripModel.loop) return;
    const outer = categoryStripRef.current;
    const inner = categoryInnerRef.current;
    if (!outer || !inner || categoryLoopJumpingRef.current) return;
    const W = inner.scrollWidth / 3;
    if (W <= 0) return;
    const x = outer.scrollLeft;
    if (x < 48) {
      categoryLoopJumpingRef.current = true;
      outer.scrollLeft = x + W;
      categoryLoopJumpingRef.current = false;
    } else if (x > 2 * W - 48) {
      categoryLoopJumpingRef.current = true;
      outer.scrollLeft = x - W;
      categoryLoopJumpingRef.current = false;
    }
  }, [categoryStripModel.loop]);

  useLayoutEffect(() => {
    const outer = categoryStripRef.current;
    const inner = categoryInnerRef.current;
    if (!outer) return;
    if (!categoryStripModel.loop) {
      outer.scrollLeft = 0;
      return;
    }
    if (!inner) return;
    const W = inner.scrollWidth / 3;
    if (W > 0) outer.scrollLeft = W;
  }, [categoryStripModel.loop, filterItems]);

  useEffect(() => {
    if (!categoryStripModel.loop) return;
    const inner = categoryInnerRef.current;
    const outer = categoryStripRef.current;
    if (!inner || !outer) return;
    const ro = new ResizeObserver(() => {
      const W = inner.scrollWidth / 3;
      if (W > 0) outer.scrollLeft = W;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [categoryStripModel.loop, filterItems]);

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

  if (loading) {
    return (
      <div className="relative flex min-h-dvh flex-col bg-[#faf8f5]">
        <Navbar onCartClick={() => setCartOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-2.5 py-2 sm:px-3 sm:py-3 md:px-6 md:py-4 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#e60000]/20 border-t-[#e60000] animate-spin"></div>
            </div>
            <p className="text-sm text-neutral-600">Loading menu…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#faf8f5]">
      <Navbar onCartClick={() => setCartOpen(true)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-2.5 py-2 sm:px-3 sm:py-3 md:px-6 md:py-4 flex flex-col">
        <>
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

        <div
          ref={categoryStripRef}
          onScroll={jumpCategoryLoop}
          className="mb-2.5 -mx-1 min-w-0 w-full touch-pan-x overflow-x-auto overscroll-x-contain pb-0.5 sm:mb-3 md:mb-4 scrollbar-hide"
        >
          <div
            ref={categoryInnerRef}
            className="flex w-max min-w-min gap-1 px-1 sm:gap-2 sm:px-1.5 md:gap-2.5"
          >
            {categoryStripModel.items.map((item, idx) => (
              <button
                key={
                  categoryStripModel.loop
                    ? `${item.listKey}-${idx}`
                    : item.listKey
                }
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="flex min-w-36 max-w-48 shrink-0 items-center gap-1 rounded-lg border border-white/80 bg-white px-2 py-1.5 text-left shadow-[0_5px_20px_-10px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_-10px_rgba(230,0,0,0.16)] sm:min-w-44 sm:max-w-52 sm:gap-1.5 sm:rounded-xl sm:px-2.5 sm:py-2 md:gap-2 md:min-w-48"
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

        {!loading && !error && orderedSections.length === 0 && dishSearch.trim() && (
          <p className="py-12 text-center font-body text-sm text-neutral-500">
            No dishes match &ldquo;{dishSearch.trim()}&rdquo;. Try another name.
          </p>
        )}

        {!loading && !error && orderedSections.length > 0 && (
          <div className="flex flex-col gap-5 sm:gap-7 md:gap-9">
            {orderedSections.map((sec) => (
              <CategorySection
                key={sec.listKey}
                id={sec.sectionId}
                title={sec.title}
              >
                {sec.items.map((p) => (
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
        </>
      </main>

      <Footer />

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
