"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";

export function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems());
  const mounted = useMounted();

  return (
    <Link
      href="/carrinho"
      className="neon-interactive relative rounded-full p-1.5 text-cyan"
      aria-label="Carrinho"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {mounted && totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red text-[10px] font-bold text-white shadow-[var(--glow-red-sm)]">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
