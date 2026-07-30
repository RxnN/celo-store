"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export async function createCategory(formData: FormData) {
  if (!(await requireAdmin())) return;

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!name || !slug) return;

  await db.category.create({ data: { name, slug, imageUrl: imageUrl || null } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function updateCategory(formData: FormData) {
  if (!(await requireAdmin())) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!id || !name || !slug) return;

  await db.category.update({ where: { id }, data: { name, slug, imageUrl: imageUrl || null } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  if (!(await requireAdmin())) return;

  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
