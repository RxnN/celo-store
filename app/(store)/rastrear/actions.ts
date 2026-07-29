"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export type TrackedOrder = {
  id: string;
  status: string;
  trackingCode: string | null;
  total: number;
  createdAt: string;
  items: { name: string; size: string; color: string; quantity: number }[];
};

export type TrackOrderState = { error?: string; order?: TrackedOrder };

export async function trackOrder(
  _prev: TrackOrderState,
  formData: FormData
): Promise<TrackOrderState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!orderId || !email) {
    return { error: "Informe o número do pedido e o e-mail usado na compra." };
  }

  const turnstileOk = await verifyTurnstileToken(formData.get("cfTurnstileToken") as string | null);
  if (!turnstileOk) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }

  const ip = getClientIp(await headers());
  const rateLimit = checkRateLimit(`rastrear:${ip}`, 10, 10 * 60 * 1000);
  if (!rateLimit.ok) {
    return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true, variant: true } },
    },
  });

  const orderEmail = (order?.user?.email ?? order?.guestEmail ?? "").toLowerCase();
  if (!order || !orderEmail || orderEmail !== email) {
    return { error: "Pedido não encontrado. Confira o número e o e-mail informados." };
  }

  return {
    order: {
      id: order.id,
      status: order.status,
      trackingCode: order.trackingCode,
      total: toNumber(order.total),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        name: item.product.name,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
      })),
    },
  };
}
