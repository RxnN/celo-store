"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export async function createBrand(formData: FormData) {
  if (!(await requireAdmin())) return;

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name || !slug) return;

  await db.brand.create({ data: { name, slug } });
  revalidatePath("/admin/marcas");
}

export async function updateBrand(formData: FormData) {
  if (!(await requireAdmin())) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!id || !name || !slug) return;

  await db.brand.update({ where: { id }, data: { name, slug } });
  revalidatePath("/admin/marcas");
}

export async function deleteBrand(id: string) {
  if (!(await requireAdmin())) return;

  await db.brand.delete({ where: { id } });
  revalidatePath("/admin/marcas");
}
