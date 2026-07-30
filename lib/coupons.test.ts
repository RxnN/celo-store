import { describe, it, expect } from "vitest";
import { calculateCouponDiscount, type CouponCartItem } from "./coupons";
import type { Coupon } from "@prisma/client";

type CouponInput = Pick<Coupon, "scope" | "type" | "value" | "productId">;

// Os testes só se importam com scope/type/value/productId (os únicos campos
// que calculateCouponDiscount lê) — o cast evita depender do tipo exato do
// Decimal do Prisma só para montar um fixture de teste.
function coupon(overrides: Partial<Omit<CouponInput, "value">> & { value: number }): CouponInput {
  return { scope: "ORDER_TOTAL", type: "PERCENT", productId: null, ...overrides } as unknown as CouponInput;
}

describe("calculateCouponDiscount", () => {
  const items: CouponCartItem[] = [
    { productId: "p1", quantity: 2, price: 50 },
    { productId: "p2", quantity: 1, price: 30 },
  ];
  const subtotal = 130;

  it("aplica desconto percentual sobre o total do pedido", () => {
    const result = calculateCouponDiscount(coupon({ scope: "ORDER_TOTAL", type: "PERCENT", value: 10 }), items, subtotal);
    expect(result).toBe(13);
  });

  it("aplica desconto fixo sobre o total do pedido sem ultrapassar o subtotal", () => {
    const result = calculateCouponDiscount(coupon({ scope: "ORDER_TOTAL", type: "FIXED", value: 200 }), items, subtotal);
    expect(result).toBe(130);
  });

  it("aplica desconto percentual só sobre o produto específico do cupom", () => {
    const result = calculateCouponDiscount(
      coupon({ scope: "SPECIFIC_PRODUCT", type: "PERCENT", value: 20, productId: "p1" }),
      items,
      subtotal
    );
    expect(result).toBe(20); // 20% de 100 (2 × 50, só o produto p1)
  });

  it("aplica desconto fixo sem ultrapassar o subtotal do produto específico", () => {
    const result = calculateCouponDiscount(
      coupon({ scope: "SPECIFIC_PRODUCT", type: "FIXED", value: 500, productId: "p1" }),
      items,
      subtotal
    );
    expect(result).toBe(100);
  });

  it("retorna 0 quando o produto do cupom não está no carrinho", () => {
    const result = calculateCouponDiscount(
      coupon({ scope: "SPECIFIC_PRODUCT", type: "FIXED", value: 10, productId: "p3" }),
      items,
      subtotal
    );
    expect(result).toBe(0);
  });
});
