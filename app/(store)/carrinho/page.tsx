"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { ProductImagePlaceholder } from "@/components/product/ProductImagePlaceholder";
import { LinkButton } from "@/components/ui/Button";
import { useMounted } from "@/lib/use-mounted";
import { CartUpsell } from "@/components/cart/CartUpsell";
import { ShippingEstimate } from "@/components/shared/ShippingEstimate";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalPrice } = useCartStore();
  const mounted = useMounted();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6">
        <h1 className="mb-3 text-xl font-extrabold">Seu carrinho está vazio</h1>
        <p className="mb-6 text-sm text-text-muted">
          Adicione produtos pra ver eles por aqui.
        </p>
        <LinkButton href="/">continuar comprando</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
      <h1 className="mb-6 text-xl font-extrabold">Carrinho</h1>

      <div className="mb-8 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <ProductImagePlaceholder className="h-20 w-20 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/produto/${item.slug}`} className="font-semibold hover:text-cyan">
                  {item.name}
                </Link>
                <button
                  onClick={() => removeItem(item.variantId)}
                  aria-label="Remover item"
                  className="text-text-faint hover:text-red"
                >
                  ✕
                </button>
              </div>
              <p className="mb-3 text-xs text-text-muted">
                Tamanho {item.size} · Cor {item.color}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    className="neon-interactive h-7 w-7 rounded-md border border-line text-sm hover:text-cyan"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    className="neon-interactive h-7 w-7 rounded-md border border-line text-sm hover:text-cyan"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold tabular-nums text-cyan">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between border-t border-line pt-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-faint">Subtotal</p>
          <p className="text-xl font-extrabold tabular-nums">{formatPrice(totalPrice())}</p>
        </div>
        <LinkButton href="/checkout">finalizar compra</LinkButton>
      </div>

      <ShippingEstimate
        items={items.map((i) => ({ productId: i.productId, quantity: i.quantity }))}
        subtotal={totalPrice()}
      />

      <CartUpsell productIds={Array.from(new Set(items.map((i) => i.productId)))} />
    </div>
  );
}
