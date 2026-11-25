"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Banner } from "@/lib/data/types";

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const settings = {
    autoplay: banners[0]?.autoplay !== false,
    interval: (banners[0]?.intervalSec ?? 5) * 1000,
    transition: banners[0]?.transition ?? "fade",
    showArrows: banners[0]?.showArrows !== false,
    showDots: banners[0]?.showDots !== false,
  };

  const next = useCallback(() => setI((v) => (v + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setI((v) => (v - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (paused || !settings.autoplay || banners.length < 2 || reduced) return;
    const t = setInterval(next, settings.interval);
    return () => clearInterval(t);
  }, [paused, next, banners.length, settings.autoplay, settings.interval, reduced]);

  if (!banners.length) return null;
  const b = banners[i];
  const pos = b.textPosition ?? "left";
  const overlay = Math.min(90, Math.max(0, b.overlayOpacity ?? 65)) / 100;

  return (
    <section
      className="relative h-[62vh] min-h-[420px] max-h-[720px] sm:h-[78vh] sm:min-h-[540px] sm:max-h-[820px] overflow-hidden bg-[var(--color-ink)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={b.id}
          className="absolute inset-0"
          initial={reduced ? false : { opacity: 0, scale: settings.transition === "slide" ? 1 : 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.image}
            alt={b.title}
            className="absolute inset-0 h-full w-full object-cover hidden sm:block"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.mobileImage || b.image}
            alt={b.title}
            className="absolute inset-0 h-full w-full object-cover sm:hidden"
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlay * 0.55 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-14 sm:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={b.id + "-txt"}
              initial={reduced ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: reduced ? 0 : 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`max-w-2xl ${pos === "center" ? "mx-auto text-center" : pos === "right" ? "ml-auto text-right" : ""}`}
            >
              <p className="eyebrow !text-[#B79A61] mb-2 sm:mb-4 text-[0.6rem] sm:text-[0.7rem]">Luxury Wallpaper House</p>
              <h1 className="font-display text-[1.2rem] sm:text-3xl lg:text-6xl leading-tight text-white">{b.title}</h1>
              {b.subtitle && <p className="mt-3 sm:mt-4 text-white/85 text-xs sm:text-base max-w-lg leading-relaxed">{b.subtitle}</p>}
              {b.link && (
                <Link href={b.link} className="btn-lux mt-4 sm:mt-8 !px-4 sm:!px-8 !py-2.5 sm:!py-3 !text-[0.6rem] sm:!text-[0.75rem] !bg-[#B79A61] !border-[#B79A61] !text-[#30251F] hover:!bg-white hover:!border-white">
                  {b.linkLabel ?? "Discover"}
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {banners.length > 1 && settings.showArrows && (
        <>
          <button onClick={prev} aria-label="Previous slide" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} aria-label="Next slide" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
            <ChevronRight size={18} />
          </button>
        </>
      )}
      {banners.length > 1 && settings.showDots && (
        <div className="absolute bottom-5 right-4 sm:right-10 z-10 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-0.5 transition-all duration-500 ${idx === i ? "w-10 bg-[#B79A61]" : "w-5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
