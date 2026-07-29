"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "./ProductGallery";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ShippingEstimate } from "../shared/ShippingEstimate";
import { formatPrice, discountPercent } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useCartToastStore } from "@/lib/cart-toast-store";

export type ProductDetailData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  brand: { name: string } | null;
  category: { name: string; slug: string };
  variants: { id: string; size: string; color: string; stock: number }[];
  images: string[];
};

export function ProductDetail({ product }: { product: ProductDetailData }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useCartToastStore((s) => s.show);

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants]
  );

  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.size === size && v.color === color);
  const off = product.compareAtPrice ? discountPercent(product.price, product.compareAtPrice) : 0;
  const allOutOfStock = product.variants.every((v) => v.stock === 0);

  function addToCart() {
    if (!selectedVariant || selectedVariant.stock === 0) return false;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.price,
      quantity: 1,
    });
    return true;
  }

  function handleAddToCart() {
    if (!addToCart()) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    showToast({
      name: product.name,
      image: product.images[0] ?? null,
      price: product.price,
      quantity: 1,
    });
  }

  function handleBuyNow() {
    if (!addToCart()) return;
    router.push("/checkout");
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <ProductGallery
        images={product.images}
        alt={product.name}
        badge={off > 0 ? <Badge tone="red">-{off}% OFF</Badge> : null}
        outOfStock={allOutOfStock}
      />

      <div>
        {product.brand ? (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-faint">
            {product.brand.name}
          </p>
        ) : null}
        <h1 className="mb-3 font-display text-3xl leading-tight tracking-wide text-balance">
          {product.name}
        </h1>

        <div className="mb-5 flex items-baseline gap-3">
          {product.compareAtPrice ? (
            <span className="text-sm text-text-faint line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
          <span className="text-2xl font-extrabold tabular-nums text-cyan">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-text-muted">{product.description}</p>

        {sizes.length > 1 || sizes[0] !== "Único" ? (
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-faint">
              Tamanho
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`neon-interactive rounded-lg border px-4 py-2 text-sm font-semibold ${
                    s === size
                      ? "border-cyan bg-cyan/10 text-cyan shadow-[var(--glow-cyan-sm)]"
                      : "border-line text-text-muted hover:text-cyan"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-faint">Cor</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`neon-interactive rounded-lg border px-4 py-2 text-sm font-semibold ${
                  c === color
                    ? "border-cyan bg-cyan/10 text-cyan shadow-[var(--glow-cyan-sm)]"
                    : "border-line text-text-muted hover:text-cyan"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {selectedVariant && selectedVariant.stock === 0 ? (
          <p className="mb-4 text-sm font-semibold text-red">Esgotado nessa combinação.</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            finalizar compra
          </Button>
          <Button
            variant="surface"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? "adicionado ✓" : "adicionar ao carrinho"}
          </Button>
        </div>
        <button
          onClick={() => router.push("/carrinho")}
          className="mt-3 text-xs text-text-faint hover:text-cyan"
        >
          ver carrinho →
        </button>

        <div className="mt-6">
          <ShippingEstimate items={[{ productId: product.id, quantity: 1 }]} subtotal={product.price} />
        </div>
      </div>
    </div>
  );
}
