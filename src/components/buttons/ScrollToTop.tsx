"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";

const SHOW_AFTER_PX = 280;

export function ScrollToTop() {
  const { lines } = useCart();
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(window.scrollY > SHOW_AFTER_PX);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  const cartOpen = lines.length > 0;

  return (
    <button
      type="button"
      onClick={goTop}
      className={`fixed right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#E30000] text-white shadow-[0_4px_20px_rgba(227,0,0,0.55),0_2px_8px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:shadow-[0_6px_28px_rgba(227,0,0,0.6)] active:scale-95 sm:right-6 sm:h-14 sm:w-14 ${
        cartOpen
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-32"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-8"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
