"use client";

import { useEffect, useState } from "react";
import { UpsellGrid } from "@/components/product/UpsellGrid";
import type { ProductCardData } from "@/components/product/product-card-data";

export function CartUpsell({ productIds }: { productIds: string[] }) {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const key = productIds.join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/upsell?exclude=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return <UpsellGrid title="Complete seu look" products={products} />;
}
