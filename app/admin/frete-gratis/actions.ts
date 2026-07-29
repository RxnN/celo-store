"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { FreeShippingType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guards";

const RuleSchema = z.object({
  label: z.string().min(2),
  type: z.nativeEnum(FreeShippingType),
  minValue: z.coerce.number().positive().optional().or(z.literal("")),
  minQuantity: z.coerce.number().int().positive().optional().or(z.literal("")),
  productId: z.string().optional(),
});

export type FreeShippingFormState = { error?: string };

export async function createFreeShippingRule(
  _prev: FreeShippingFormState,
  formData: FormData
): Promise<FreeShippingFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = RuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { label, type, minValue, minQuantity, productId } = parsed.data;

  if (type === "MIN_VALUE" && !minValue) {
    return { error: "Informe o valor mínimo do carrinho." };
  }
  if (type === "MIN_QUANTITY" && !minQuantity) {
    return { error: "Informe a quantidade mínima de itens." };
  }
  if (type === "SPECIFIC_PRODUCT" && !productId) {
    return { error: "Escolha o produto." };
  }

  await db.freeShippingRule.create({
    data: {
      label,
      type,
      minValue: type === "MIN_VALUE" ? Number(minValue) : null,
      minQuantity: type === "MIN_QUANTITY" ? Number(minQuantity) : null,
      productId: type === "SPECIFIC_PRODUCT" ? productId || null : null,
    },
  });

  revalidatePath("/admin/frete-gratis");
  return {};
}

export async function toggleFreeShippingRule(id: string, active: boolean) {
  if (!(await requireAdmin())) return;

  await db.freeShippingRule.update({ where: { id }, data: { active } });
  revalidatePath("/admin/frete-gratis");
}

export async function deleteFreeShippingRule(id: string) {
  if (!(await requireAdmin())) return;

  await db.freeShippingRule.delete({ where: { id } });
  revalidatePath("/admin/frete-gratis");
}
