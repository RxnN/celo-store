import { describe, it, expect, vi, beforeEach } from "vitest";
import { isFreeShippingApplicable, type ShippingCartItem } from "./shipping-rules";
import { db } from "./db";
import type { FreeShippingRule } from "@prisma/client";

vi.mock("./db", () => ({
  db: { freeShippingRule: { findMany: vi.fn() } },
}));

function rule(overrides: Partial<FreeShippingRule>): FreeShippingRule {
  return {
    id: "r1",
    label: "regra",
    type: "MIN_VALUE",
    minValue: null,
    minQuantity: null,
    productId: null,
    active: true,
    createdAt: new Date(),
    ...overrides,
  } as FreeShippingRule;
}

const findManyMock = vi.mocked(db.freeShippingRule.findMany);

describe("isFreeShippingApplicable", () => {
  const items: ShippingCartItem[] = [{ productId: "p1", quantity: 3 }];

  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("retorna false quando não há regras ativas", async () => {
    findManyMock.mockResolvedValue([]);
    expect(await isFreeShippingApplicable(items, 100)).toBe(false);
  });

  it("MIN_VALUE: aplica quando o subtotal atinge o mínimo", async () => {
    findManyMock.mockResolvedValue([rule({ type: "MIN_VALUE", minValue: 250 as unknown as FreeShippingRule["minValue"] })]);
    expect(await isFreeShippingApplicable(items, 250)).toBe(true);
    expect(await isFreeShippingApplicable(items, 249)).toBe(false);
  });

  it("MIN_QUANTITY: aplica quando a quantidade total atinge o mínimo", async () => {
    findManyMock.mockResolvedValue([rule({ type: "MIN_QUANTITY", minQuantity: 3 })]);
    expect(await isFreeShippingApplicable(items, 10)).toBe(true);
    expect(await isFreeShippingApplicable([{ productId: "p1", quantity: 2 }], 10)).toBe(false);
  });

  it("SPECIFIC_PRODUCT: aplica só quando o produto está no carrinho", async () => {
    findManyMock.mockResolvedValue([rule({ type: "SPECIFIC_PRODUCT", productId: "p1" })]);
    expect(await isFreeShippingApplicable(items, 10)).toBe(true);
    expect(await isFreeShippingApplicable([{ productId: "p2", quantity: 1 }], 10)).toBe(false);
  });
});
