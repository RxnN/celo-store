import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const BodySchema = z.object({
  code: z.string().min(1),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().positive(), price: z.number() }))
    .min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`cupom:${ip}`, 10, 5 * 60 * 1000);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const result = await validateCoupon(parsed.data.code, parsed.data.items, parsed.data.subtotal);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    code: result.coupon.code,
    discount: result.discount,
    type: result.coupon.type,
    scope: result.coupon.scope,
  });
}
