"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { BannerPlacement } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guards";

export type BannerFormState = { error?: string };

export async function createBanner(
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const theme = String(formData.get("theme") ?? "cyan");
  const placement = String(formData.get("placement") ?? "CARD") as BannerPlacement;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageOnly = formData.get("imageOnly") === "on" || placement === "HERO";
  const position = Number(formData.get("position") ?? 0);

  if (placement === "HERO" && !imageUrl) {
    return { error: "O banner cheio precisa de uma imagem." };
  }
  if (imageOnly && !imageUrl) {
    return { error: "Envie uma imagem ou desmarque \"somente imagem\"." };
  }
  if (!imageOnly && !title) {
    return { error: "Informe um título (ou marque \"somente imagem\" e envie uma foto)." };
  }

  await db.banner.create({
    data: {
      title: title || null,
      subtitle: subtitle || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
      theme,
      placement,
      imageUrl: imageUrl || null,
      imageOnly,
      position,
    },
  });
  revalidatePath("/admin/banners");
  return {};
}

export async function toggleBanner(id: string, active: boolean) {
  if (!(await requireAdmin())) return;

  await db.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
}

