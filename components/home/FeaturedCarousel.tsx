"use client";

import { useRef } from "react";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";
import { PromoCard, PromoCardData } from "./PromoCard";

export function FeaturedCarousel({
  promos,
  products,
}: {
  promos: PromoCardData[];
  products: ProductCardData[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  if (promos.length === 0 && products.length === 0) return null;

  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-cyan shadow-[var(--glow-cyan-sm)]" />
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-cyan">destaques</h2>
        <div className="ml-auto flex gap-2">
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
      </div>

      <div
        ref={trackRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-2 pb-1"
      >
        {promos.map((promo) => (
          <div key={`promo-${promo.id}`} className="w-[62%] shrink-0 snap-start sm:w-[220px]">
            <PromoCard promo={promo} size="slide" />
          </div>
        ))}
        {products.map((product) => (
          <div key={product.slug} className="w-[62%] shrink-0 snap-start sm:w-[220px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
