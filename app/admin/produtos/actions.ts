"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

const VariantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.coerce.number().int().min(0),
});

const optionalInt = z.coerce.number().int().positive().optional().or(z.literal(""));

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  variantsJson: z.string(),
  imagesJson: z.string().optional(),
  weightGrams: optionalInt,
  heightCm: optionalInt,
  widthCm: optionalInt,
  lengthCm: optionalInt,
});

function parseVariants(json: string) {
  const raw = JSON.parse(json);
  return z.array(VariantSchema).min(1, "Adicione pelo menos uma variação.").parse(raw);
}

function parseImages(json: string | undefined) {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    return z.array(z.string()).parse(raw);
  } catch {
    return [];
  }
}

export type ProductFormState = { error?: string };

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let variants;
  try {
    variants = parseVariants(parsed.data.variantsJson);
  } catch {
    return { error: "Adicione pelo menos uma variação de tamanho/cor." };
  }

  const images = parseImages(parsed.data.imagesJson);

  const existing = await db.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "Já existe um produto com esse slug." };

  await db.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice ? Number(parsed.data.compareAtPrice) : null,
      categoryId: parsed.data.categoryId,
      subcategoryId: parsed.data.subcategoryId || null,
      brandId: parsed.data.brandId || null,
      featured: Boolean(parsed.data.featured),
      active: parsed.data.active !== undefined ? Boolean(parsed.data.active) : true,
      weightGrams: parsed.data.weightGrams ? Number(parsed.data.weightGrams) : null,
      heightCm: parsed.data.heightCm ? Number(parsed.data.heightCm) : null,
      widthCm: parsed.data.widthCm ? Number(parsed.data.widthCm) : null,
      lengthCm: parsed.data.lengthCm ? Number(parsed.data.lengthCm) : null,
      variants: { create: variants },
      images: { create: images.map((url, position) => ({ url, position })) },
    },
  });

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let variants;
  try {
    variants = parseVariants(parsed.data.variantsJson);
  } catch {
    return { error: "Adicione pelo menos uma variação de tamanho/cor." };
  }

  const images = parseImages(parsed.data.imagesJson);

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice ? Number(parsed.data.compareAtPrice) : null,
        categoryId: parsed.data.categoryId,
        subcategoryId: parsed.data.subcategoryId || null,
        brandId: parsed.data.brandId || null,
        featured: Boolean(parsed.data.featured),
        active: Boolean(parsed.data.active),
        weightGrams: parsed.data.weightGrams ? Number(parsed.data.weightGrams) : null,
        heightCm: parsed.data.heightCm ? Number(parsed.data.heightCm) : null,
        widthCm: parsed.data.widthCm ? Number(parsed.data.widthCm) : null,
        lengthCm: parsed.data.lengthCm ? Number(parsed.data.lengthCm) : null,
      },
    });

    await tx.productVariant.deleteMany({ where: { productId } });
    await tx.productVariant.createMany({
      data: variants.map((v) => ({ ...v, productId })),
    });

    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productImage.createMany({
      data: images.map((url, position) => ({ url, position, productId })),
    });
  });

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProduct(productId: string, active: boolean) {
  if (!(await requireAdmin())) return;

  await db.product.update({ where: { id: productId }, data: { active } });
  revalidatePath("/admin/produtos");
}
