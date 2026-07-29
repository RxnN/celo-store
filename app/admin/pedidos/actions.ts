"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guards";

export async function updateOrderStatus(
  orderId: string,
  formData: FormData
): Promise<{ error?: string } | void> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const status = String(formData.get("status")) as OrderStatus;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();

  if (status === "SHIPPED" && !trackingCode) {
    return { error: "Informe o código de rastreio antes de marcar como enviado." };
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(trackingCode ? { trackingCode } : {}),
    },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
}
