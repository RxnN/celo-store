"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ProductImagePlaceholder } from "@/components/product/ProductImagePlaceholder";
import { formatPrice } from "@/lib/utils";
import { useCartToastStore } from "@/lib/cart-toast-store";

export function CartAddedToast() {
  const { item, token, hide } = useCartToastStore();

  useEffect(() => {
    if (!item) return;
    const hideTimer = setTimeout(() => hide(), 3200);
    return () => clearTimeout(hideTimer);
  }, [token, item, hide]);

  if (!item) return null;

  return (
    <div
      key={token}
      className="toast-in fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-5 sm:top-20 sm:bottom-auto"
    >
      <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-cyan/40 bg-surface p-3 shadow-[var(--glow-cyan-sm)]">
        <ProductImagePlaceholder className="h-14 w-14 shrink-0" src={item.image} alt={item.name} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-cyan">adicionado ao carrinho</p>
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-text-muted">
            {item.quantity}x {formatPrice(item.price)}
          </p>
        </div>
        <Link
          href="/carrinho"
          className="neon-interactive shrink-0 rounded-lg bg-cyan px-3 py-2 text-xs font-extrabold text-cyan-ink"
        >
          ver carrinho
        </Link>
      </div>
    </div>
  );
}
