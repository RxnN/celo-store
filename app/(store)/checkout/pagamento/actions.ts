"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function confirmPayment(orderId: string): Promise<{ error?: string }> {
  const session = await auth();

  const order = await db.order.findUnique({ where: { id: orderId } });
  const isOwner = order?.userId ? order.userId === session?.user?.id : Boolean(order);
  if (!order || !isOwner) {
    return { error: "Pedido não encontrado." };
  }

  if (order.status === "PENDING") {
    await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });
  }

  return {};
}
