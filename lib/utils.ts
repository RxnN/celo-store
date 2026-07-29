export function toNumber(value: unknown): number {
  return Number(value);
}

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

const FREE_SHIPPING_THRESHOLD = 250;
const FLAT_SHIPPING_RATE = 19.9;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}

export function discountPercent(price: number | string, compareAt: number | string): number {
  const p = typeof price === "string" ? Number(price) : price;
  const c = typeof compareAt === "string" ? Number(compareAt) : compareAt;
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}
