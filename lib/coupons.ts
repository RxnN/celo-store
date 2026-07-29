import { db } from "./db";
import type { Coupon } from "@prisma/client";

export type CouponCartItem = { productId: string; quantity: number; price: number };

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string };

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function validateCoupon(
  code: string,
  items: CouponCartItem[],
  subtotal: number
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "Informe um cupom." };

  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active) {
    return { ok: false, error: "Cupom inválido ou expirado." };
  }

  const discount = calculateCouponDiscount(coupon, items, subtotal);
  if (discount <= 0) {
    return {
      ok: false,
      error:
        coupon.scope === "SPECIFIC_PRODUCT"
          ? "Esse cupom só vale pra um produto específico que não está no seu carrinho."
          : "Esse cupom não pôde ser aplicado ao seu carrinho.",
    };
  }

  return { ok: true, coupon, discount };
}

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "scope" | "type" | "value" | "productId">,
  items: CouponCartItem[],
  subtotal: number
): number {
  const value = Number(coupon.value);

  if (coupon.scope === "ORDER_TOTAL") {
    const raw = coupon.type === "PERCENT" ? (subtotal * value) / 100 : value;
    return round2(Math.min(raw, subtotal));
  }

  const matching = items.filter((i) => i.productId === coupon.productId);
  if (matching.length === 0) return 0;
  const matchingSubtotal = matching.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const raw = coupon.type === "PERCENT" ? (matchingSubtotal * value) / 100 : value;
  return round2(Math.min(raw, matchingSubtotal));
}
