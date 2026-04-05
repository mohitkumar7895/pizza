"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: [string, string, string];
};

/** Time between automatic slide changes */
const AUTO_MS = 1400;
/** Cooldown after user swipes / hovers before auto resumes */
const PAUSE_AFTER_INTERACTION_MS = 3000;

export function HeroBanner({ images }: Props) {
  const active = useMemo(
    () => images.map((u) => u.trim()).filter(Boolean),
    [images],
  );
  const count = active.length;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const pauseUntilRef = useRef(0);
  const reducedMotionRef = useRef(false);
  /** Avoid treating auto-advance scroll as user interaction */
  const programmaticScrollRef = useRef(false);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || count <= 1) return;
    const slideW = el.clientWidth;
    if (slideW <= 0) return;
    const i = Math.round(el.scrollLeft / slideW);
    setActiveSlide(Math.min(count - 1, Math.max(0, i)));
  }, [count]);

  const bumpPause = useCallback(() => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
  }, []);

  useEffect(() => {
    if (count <= 1) return;
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!programmaticScrollRef.current) bumpPause();
      updateActiveFromScroll();
    };

    updateActiveFromScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateActiveFromScroll, count, bumpPause]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el || count <= 1) return;
      const slideW = el.clientWidth;
      if (slideW <= 0) return;
      const i = ((index % count) + count) % count;
      programmaticScrollRef.current = true;
      el.scrollTo({
        left: i * slideW,
        behavior: reducedMotionRef.current ? "auto" : "smooth",
      });
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 700);
    },
    [count],
  );

  /** Auto-advance: loops, pauses after manual scroll / hover / tab hidden */
  useEffect(() => {
    if (count <= 1) return;

    const tick = () => {
      if (reducedMotionRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible")
        return;
      if (Date.now() < pauseUntilRef.current) return;

      const el = scrollerRef.current;
      if (!el) return;
      const slideW = el.clientWidth;
      if (slideW <= 0) return;

      const current = Math.round(el.scrollLeft / slideW);
      const next = (current + 1) % count;
      programmaticScrollRef.current = true;
      el.scrollTo({
        left: next * slideW,
        behavior: "smooth",
      });
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 700);
    };

    const id = window.setInterval(tick, AUTO_MS);
    return () => clearInterval(id);
  }, [count]);

  if (active.length === 0) return null;

  return (
    <section className="mb-2 w-full sm:mb-3 md:mb-5">
      {/* Same width as product grid (parent main is max-w-6xl) */}
      <div
        className={[
          "group relative overflow-hidden rounded-2xl sm:rounded-3xl",
          "ring-1 ring-[#e60000]/10 shadow-[0_16px_48px_-20px_rgba(180,20,20,0.35)]",
          "bg-linear-to-b from-white/80 to-[#fff8f5]",
        ].join(" ")}
        onMouseEnter={bumpPause}
        onFocusCapture={bumpPause}
      >
        <div
          ref={scrollerRef}
          className={[
            "flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth",
            "touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "md:h-80 lg:h-87.5",
          ].join(" ")}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Promotional banners"
        >
          {active.map((u, i) => (
            <div
              key={`${u}-${i}`}
              className="box-border w-full min-w-0 shrink-0 grow-0 basis-full snap-start flex-[0_0_100%] md:h-full md:min-h-0"
            >
              <div className="overflow-hidden bg-[#0a0a0a] md:h-full md:min-h-0">
                <div className="relative aspect-28/9 w-full md:aspect-auto md:h-full md:min-h-0">
                  <Image
                    src={u}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 1152px) 72rem, (min-width: 768px) 100vw, 100vw"
                    priority={i === 0}
                    unoptimized={u.startsWith("http") || u.startsWith("//")}
                  />
                  {/* Bottom fade for dots + depth */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 via-black/15 to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-linear-to-t from-black/25 to-transparent sm:h-20"
              aria-hidden
            />
            <div
              className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-4"
              role="tablist"
              aria-label="Banner slides"
            >
              {active.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === i}
                  aria-label={`Slide ${i + 1} of ${count}`}
                  className={[
                    "pointer-events-auto h-2 rounded-full transition-all duration-300 ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
                    activeSlide === i
                      ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                      : "w-2 bg-white/45 hover:bg-white/70",
                  ].join(" ")}
                  onClick={() => {
                    bumpPause();
                    goToSlide(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
