import { db } from "./db";
import { calculateShipping } from "./utils";
import { isFreeShippingApplicable, type ShippingCartItem } from "./shipping-rules";
import { isMelhorEnvioConfigured, quoteMelhorEnvioShipping } from "./melhor-envio";

export type ShippingQuote = {
  value: number;
  free: boolean;
  source: "free-rule" | "melhor-envio" | "flat-rate";
};

export async function getShippingQuote(
  items: ShippingCartItem[],
  subtotal: number,
  destinationZip?: string
): Promise<ShippingQuote> {
  const free = await isFreeShippingApplicable(items, subtotal);
  if (free) {
    return { value: 0, free: true, source: "free-rule" };
  }

  if (isMelhorEnvioConfigured() && destinationZip && destinationZip.replace(/\D/g, "").length === 8) {
    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, price: true, weightGrams: true, heightCm: true, widthCm: true, lengthCm: true },
    });

    const quoteItems = items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price),
          weightGrams: product.weightGrams,
          heightCm: product.heightCm,
          widthCm: product.widthCm,
          lengthCm: product.lengthCm,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    const price = await quoteMelhorEnvioShipping(quoteItems, destinationZip);
    if (price !== null) {
      return { value: price, free: false, source: "melhor-envio" };
    }
  }

  const flat = calculateShipping(subtotal);
  return { value: flat, free: flat === 0, source: "flat-rate" };
}
