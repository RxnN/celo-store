import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getShippingQuote } from "@/lib/shipping";
import { validateCoupon } from "@/lib/coupons";
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { isTrustedOrigin } from "@/lib/verify-origin";
import { verifyTurnstileToken } from "@/lib/turnstile";

const CheckoutSchema = z.object({
  address: z.object({
    label: z.string().optional(),
    recipient: z.string().min(2),
    street: z.string().min(2),
    number: z.string().min(1),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2),
    zip: z.string().min(8),
    phone: z.string().min(8),
  }),
  items: z
    .array(z.object({ variantId: z.string(), quantity: z.number().int().positive() }))
    .min(1),
  couponCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  cfTurnstileToken: z.string().nullable().optional(),
});

class InsufficientStockError extends Error {
  constructor(public variantId: string) {
    super("insufficient stock");
  }
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Origem da requisição não confiável." }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:${ip}`, 10, 10 * 60 * 1000);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const session = await auth();

  const body = await request.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }

  const { address, items, couponCode, guestEmail, cfTurnstileToken } = parsed.data;

  const turnstileOk = await verifyTurnstileToken(cfTurnstileToken);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Verificação de segurança falhou. Tente novamente." },
      { status: 400 }
    );
  }

  if (!session?.user && !guestEmail) {
    return NextResponse.json(
      { error: "Informe seu e-mail para continuar sem login." },
      { status: 400 }
    );
  }

  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });

  if (variants.length !== items.length) {
    return NextResponse.json({ error: "Um ou mais itens não foram encontrados." }, { status: 400 });
  }

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${variant?.product.name ?? "um item"}.` },
        { status: 400 }
      );
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return sum + Number(variant.product.price) * item.quantity;
  }, 0);

  const shippingItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return { productId: variant.productId, quantity: item.quantity };
  });
  const shippingQuote = await getShippingQuote(shippingItems, subtotal, address.zip);
  const shipping = shippingQuote.value;

  let discount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const couponItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return { productId: variant.productId, quantity: item.quantity, price: Number(variant.product.price) };
    });
    const couponResult = await validateCoupon(couponCode, couponItems, subtotal);
    if (!couponResult.ok) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }
    discount = couponResult.discount;
    couponId = couponResult.coupon.id;
  }

  const total = Math.max(0, subtotal + shipping - discount);

  let order;
  try {
    order = await db.$transaction(async (tx) => {
      // Decremento condicional e atômico: só passa se ainda houver estoque
      // suficiente NO MOMENTO da transação. Isso evita que dois pedidos
      // concorrentes vendam a mesma última unidade (a checagem feita acima,
      // antes da transação, é só uma otimização de UX — não garante nada
      // sob concorrência).
      for (const item of items) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new InsufficientStockError(item.variantId);
        }
      }

      const savedAddress = await tx.address.create({
        data: { ...address, userId: session?.user?.id ?? null },
      });

      return tx.order.create({
        data: {
          userId: session?.user?.id ?? null,
          guestName: session?.user ? null : address.recipient,
          guestEmail: session?.user ? null : guestEmail,
          guestPhone: session?.user ? null : address.phone,
          addressId: savedAddress.id,
          subtotal,
          shipping,
          discount,
          couponId,
          total,
          status: "PENDING",
          items: {
            create: items.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId)!;
              return {
                productId: variant.productId,
                variantId: variant.id,
                quantity: item.quantity,
                unitPrice: variant.product.price,
              };
            }),
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      const variant = variants.find((v) => v.id === err.variantId);
      return NextResponse.json(
        { error: `Estoque insuficiente para ${variant?.product.name ?? "um item"}.` },
        { status: 409 }
      );
    }
    throw err;
  }

  if (isMercadoPagoConfigured()) {
    try {
      const redirectUrl = await createMercadoPagoPreference({
        orderId: order.id,
        items: items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            name: variant.product.name,
            quantity: item.quantity,
            unitPrice: Number(variant.product.price),
          };
        }),
        shipping,
        discount,
        payerEmail: session?.user?.email ?? guestEmail ?? "cliente@celostore.com.br",
      });

      if (redirectUrl) {
        await db.order.update({ where: { id: order.id }, data: { mpPreferenceId: order.id } });
        return NextResponse.json({ redirectUrl });
      }
    } catch (err) {
      console.error("Erro ao criar preferência Mercado Pago:", err);
    }
  }

  // Sem credenciais de sandbox configuradas: manda pra tela de pagamento local
  // (simulada), pra dar pra testar o fluxo completo sem depender de conta externa.
  return NextResponse.json({ redirectUrl: `/checkout/pagamento?order=${order.id}` });
}
