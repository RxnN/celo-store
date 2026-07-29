"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const AddressSchema = z.object({
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
});

export type AddressFormState = { error?: string };

export async function createAddress(
  _prev: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Faça login para continuar." };

  const parsed = AddressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existingCount = await db.address.count({ where: { userId: session.user.id } });

  await db.address.create({
    data: { ...parsed.data, userId: session.user.id, isDefault: existingCount === 0 },
  });

  revalidatePath("/conta/enderecos");
  return {};
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return;

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) return;

  await db.$transaction([
    db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    db.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/conta/enderecos");
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) return;

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) return;

  await db.address.delete({ where: { id: addressId } });
  revalidatePath("/conta/enderecos");
}
