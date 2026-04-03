"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/types";

const STORAGE_KEY = "ad-pizza-hub-cart";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "quantity" | "key"> & { quantity?: number }) => void;
  setQty: (key: string, quantity: number) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => ({
      ...p,
      key: p.key ?? `${p.productId}::${p.name}`,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    // Intentionally after mount: localStorage is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate stored cart on client only
    setLines(loadInitial());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.quantity, 0),
    [lines]
  );

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity" | "key"> & { quantity?: number }) => {
      const q = quantity(line.quantity ?? 1);
      const key = `${line.productId}::${line.name}`;
      setLines((prev) => {
        const idx = prev.findIndex((p) => p.key === key);
        if (idx === -1) {
          return [...prev, { ...line, key, quantity: q }];
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: quantity(next[idx].quantity + q),
        };
        return next;
      });
    },
    []
  );

  const setQty = useCallback((key: string, quantityVal: number) => {
    const q = quantity(quantityVal);
    setLines((prev) =>
      q <= 0
        ? prev.filter((p) => p.key !== key)
        : prev.map((p) => (p.key === key ? { ...p, quantity: q } : p))
    );
  }, []);

  const inc = useCallback((key: string) => {
    setLines((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  }, []);

  const dec = useCallback((key: string) => {
    setLines((prev) =>
      prev
        .map((p) =>
          p.key === key ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((p) => p.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      addLine,
      setQty,
      inc,
      dec,
      remove,
      clear,
    }),
    [lines, itemCount, subtotal, addLine, setQty, inc, dec, remove, clear]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

function quantity(n: number) {
  return Math.max(1, Math.floor(n));
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
