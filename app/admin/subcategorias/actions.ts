"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

export async function createSubcategory(formData: FormData) {
  if (!(await requireAdmin())) return;

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!name || !slug || !categoryId) return;

  await db.subcategory.create({ data: { name, slug, categoryId } });
  revalidatePath("/admin/subcategorias");
}

export async function updateSubcategory(formData: FormData) {
  if (!(await requireAdmin())) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!id || !name || !slug || !categoryId) return;

  await db.subcategory.update({ where: { id }, data: { name, slug, categoryId } });
  revalidatePath("/admin/subcategorias");
}

export async function deleteSubcategory(id: string) {
  if (!(await requireAdmin())) return;

  await db.subcategory.delete({ where: { id } });
  revalidatePath("/admin/subcategorias");
}
