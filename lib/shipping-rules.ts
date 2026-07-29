import { db } from "./db";

export type ShippingCartItem = { productId: string; quantity: number };

export async function isFreeShippingApplicable(
  items: ShippingCartItem[],
  subtotal: number
): Promise<boolean> {
  const rules = await db.freeShippingRule.findMany({ where: { active: true } });
  if (rules.length === 0) return false;

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const productIds = new Set(items.map((i) => i.productId));

  return rules.some((rule) => {
    if (rule.type === "MIN_VALUE" && rule.minValue !== null) {
      return subtotal >= Number(rule.minValue);
    }
    if (rule.type === "MIN_QUANTITY" && rule.minQuantity !== null) {
      return totalQuantity >= rule.minQuantity;
    }
    if (rule.type === "SPECIFIC_PRODUCT" && rule.productId) {
      return productIds.has(rule.productId);
    }
    return false;
  });
}
