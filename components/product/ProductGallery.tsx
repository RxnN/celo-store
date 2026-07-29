"use client";

import { useState } from "react";
import { ReactNode } from "react";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

export function ProductGallery({
  images,
  alt,
  badge,
  outOfStock = false,
}: {
  images: string[];
  alt: string;
  badge?: ReactNode;
  outOfStock?: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div>
      <ProductImagePlaceholder
        className="h-80 sm:h-[420px]"
        src={current}
        alt={alt}
        outOfStock={outOfStock}
      >
        {badge}
      </ProductImagePlaceholder>

      {images.length > 1 ? (
        <div className="mt-2.5 flex gap-2">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`neon-interactive h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                i === active ? "border-cyan shadow-[var(--glow-cyan-sm)]" : "border-line"
              }`}
            >
              <ProductImagePlaceholder className="h-full w-full" src={url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
