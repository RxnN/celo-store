"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { Badge } from "../ui/Badge";
import { formatPrice, discountPercent } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useCartToastStore } from "@/lib/cart-toast-store";
import { ProductCardData } from "./product-card-data";

export type { ProductCardData, ProductCardVariant } from "./product-card-data";

function isNew(createdAt: Date) {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 21;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useCartToastStore((s) => s.show);
  const [added, setAdded] = useState(false);

  const off = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0;

  const defaultVariant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null;
  const outOfStock = !defaultVariant || defaultVariant.stock === 0;

  function addToCart() {
    if (!defaultVariant) return;
    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      slug: product.slug,
      size: defaultVariant.size,
      color: defaultVariant.color,
      price: Number(product.price),
      quantity: 1,
    });
    showToast({
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity: 1,
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    router.push(`/produto/${product.slug}`);
  }

  return (
    <div className="neon-interactive neon-lift group block rounded-xl border border-line bg-surface p-3">
      <Link href={`/produto/${product.slug}`}>
        <ProductImagePlaceholder
          className="mb-2.5 h-36 sm:h-40"
          src={product.image}
          alt={product.name}
          outOfStock={outOfStock}
        >
          {off > 0 ? (
            <Badge tone="red">-{off}% OFF</Badge>
          ) : isNew(product.createdAt) ? (
            <Badge tone="violet">NOVO</Badge>
          ) : null}
        </ProductImagePlaceholder>
        <p className="mb-1 text-[13px] font-semibold leading-tight">{product.name}</p>
        {product.brand ? (
          <p className="mb-2 text-[10.5px] uppercase tracking-wide text-text-faint">
            {product.brand.name}
          </p>
        ) : null}
        <div className="mb-2.5 flex items-baseline gap-2">
          {product.compareAtPrice ? (
            <span className="text-[11.5px] text-text-faint line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
          <span className="text-[15.5px] font-extrabold tabular-nums text-cyan">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="neon-interactive flex-1 rounded-md border border-line py-2 text-center text-[11px] font-bold tracking-wide text-text-muted hover:text-cyan disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "adicionado ✓" : "adicionar"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 rounded-md bg-cyan py-2 text-center text-[11px] font-extrabold tracking-wide text-cyan-ink shadow-[var(--glow-cyan-sm)] transition-shadow duration-200 hover:shadow-[var(--glow-cyan-md)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? "esgotado" : "comprar"}
        </button>
      </div>
    </div>
  );
}
