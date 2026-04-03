"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: [string, string, string];
};

export function HeroBanner({ images }: Props) {
  const active = useMemo(
    () => images.map((u) => u.trim()).filter(Boolean),
    [images],
  );
  const count = active.length;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || count <= 1) return;
    const slideW = el.clientWidth;
    if (slideW <= 0) return;
    const i = Math.round(el.scrollLeft / slideW);
    setActiveSlide(Math.min(count - 1, Math.max(0, i)));
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const el = scrollerRef.current;
    if (!el) return;
    updateActiveFromScroll();
    el.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveFromScroll);
  }, [updateActiveFromScroll, count]);

  if (active.length === 0) return null;

  return (
    <section className="mb-1 sm:mb-3 md:mb-4">
      {/* Mobile: horizontal snap, dots overlaid on image */}
      <div className="relative w-full min-w-0 sm:hidden">
        <div
          ref={scrollerRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-visible scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {active.map((u, i) => (
            <div
              key={`${u}-${i}`}
              className="box-border w-full shrink-0 grow-0 basis-full snap-start flex-[0_0_100%]"
            >
              <div className="overflow-hidden rounded-2xl bg-[#faf8f5]">
                <div className="relative aspect-28/9 w-full">
                  <Image
                    src={u}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="100vw"
                    priority={i === 0}
                    unoptimized={u.startsWith("http") || u.startsWith("//")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {count > 1 && (
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
            aria-hidden
          >
            {active.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full shadow-sm transition-all duration-200 ${
                  activeSlide === i
                    ? "w-5 bg-[#D30000] ring-2 ring-white/90"
                    : "w-1.5 bg-white/85"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tablet & up: grid */}
      <div className="hidden sm:block">
        <div
          className={`grid gap-2.5 sm:gap-3 md:gap-4 ${
              count === 1
                ? "grid-cols-1"
                : count === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {images.map((url, i) => {
              const u = url.trim();
              if (!u) return null;
              return (
                <div
                  key={i}
                  className="relative w-full overflow-hidden rounded-xl bg-[#faf8f5] sm:rounded-2xl"
                >
                  <div className="relative aspect-21/9 w-full sm:aspect-24/9 md:aspect-28/9">
                    <Image
                      src={u}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={i === 0}
                      unoptimized={u.startsWith("http") || u.startsWith("//")}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
