"use client";

import { useRef } from "react";
import { PromoCard, PromoCardData } from "./PromoCard";

const CAROUSEL_THRESHOLD = 3;

export function PromoBanners({ banners }: { banners: PromoCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (banners.length === 0) return null;

  function scrollByAmount(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

  if (banners.length > CAROUSEL_THRESHOLD) {
    return (
      <div className="mb-8">
        <div className="mb-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Anterior"
            className="neon-interactive flex h-8 w-8 items-center justify-center rounded-full border border-line text-text-muted hover:text-cyan"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Próximo"
            className="neon-interactive flex h-8 w-8 items-center justify-center rounded-full border border-line text-text-muted hover:text-cyan"
          >
            ›
          </button>
        </div>
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-2 pb-1"
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-[70%] shrink-0 snap-start sm:w-[300px]">
              <PromoCard promo={banner} size="card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {banners.map((banner) => (
        <PromoCard key={banner.id} promo={banner} size="card" />
      ))}
    </div>
  );
}
