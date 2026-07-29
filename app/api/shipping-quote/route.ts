import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippingQuote } from "@/lib/shipping";

const BodySchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
  subtotal: z.number().nonnegative(),
  destinationZip: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const quote = await getShippingQuote(
    parsed.data.items,
    parsed.data.subtotal,
    parsed.data.destinationZip
  );

  return NextResponse.json(quote);
}
