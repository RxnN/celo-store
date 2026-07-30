"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HeroBanner = {
  id: string;
  title: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
};

const INTERVAL_MS = 3000;

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
  const slides = banners.filter((b) => b.imageUrl);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function goTo(index: number) {
    setActive((index + slides.length) % slides.length);
  }

  return (
    <div className="relative aspect-[12/5] max-h-[560px] w-full overflow-hidden border-b border-line sm:max-h-[680px]">
      {slides.map((slide, i) => {
        const image = (
          <Image
            src={slide.imageUrl!}
            alt={slide.title ?? ""}
            fill
            priority={i === 0}
            className="object-cover"
          />
        );
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
          >
            {slide.ctaHref ? (
              <Link href={slide.ctaHref} className="relative block h-full w-full">
                {image}
              </Link>
            ) : (
              image
            )}
          </div>
        );
      })}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Banner anterior"
            className="neon-interactive absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-text backdrop-blur hover:text-cyan sm:h-10 sm:w-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Próximo banner"
            className="neon-interactive absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-text backdrop-blur hover:text-cyan sm:h-10 sm:w-10"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-cyan" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
