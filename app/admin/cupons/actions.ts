"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { CouponType, CouponScope } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guards";

const CouponSchema = z.object({
  code: z.string().min(2),
  type: z.nativeEnum(CouponType),
  scope: z.nativeEnum(CouponScope),
  value: z.coerce.number().positive(),
  productId: z.string().optional(),
});

export type CouponFormState = { error?: string };

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = CouponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { code, type, scope, value, productId } = parsed.data;

  if (scope === "SPECIFIC_PRODUCT" && !productId) {
    return { error: "Escolha o produto." };
  }
  if (type === "PERCENT" && value > 100) {
    return { error: "O percentual não pode passar de 100%." };
  }

  const normalizedCode = code.trim().toUpperCase();
  const existing = await db.coupon.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return { error: "Já existe um cupom com esse código." };
  }

  await db.coupon.create({
    data: {
      code: normalizedCode,
      type,
      scope,
      value,
      productId: scope === "SPECIFIC_PRODUCT" ? productId || null : null,
    },
  });

  revalidatePath("/admin/cupons");
  return {};
}

export async function toggleCoupon(id: string, active: boolean) {
  if (!(await requireAdmin())) return;

  await db.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/cupons");
}
