import { NextResponse } from "next/server";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";

function isValidSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id;

  if (!paymentId || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(request, String(paymentId))) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    const payment = await new Payment(client).get({ id: paymentId });

    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const status = payment.status === "approved" ? "PAID" : payment.status === "rejected" ? "CANCELED" : "PENDING";

    await db.order.update({
      where: { id: orderId },
      data: { status, mpPaymentId: String(payment.id) },
    });
  } catch (err) {
    console.error("Erro ao processar webhook Mercado Pago:", err);
  }

  return NextResponse.json({ received: true });
}
