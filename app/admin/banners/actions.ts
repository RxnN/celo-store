"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { BannerPlacement } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guards";

export type BannerFormState = { error?: string };

type ParsedBanner = {
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  theme: string;
  placement: BannerPlacement;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  imageOnly: boolean;
  position: number;
  categoryId: string | null;
};

function parseBannerForm(formData: FormData): { error: string } | { data: ParsedBanner } {
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const theme = String(formData.get("theme") ?? "cyan");
  const placement = String(formData.get("placement") ?? "CARD") as BannerPlacement;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageUrlMobile = String(formData.get("imageUrlMobile") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const imageOnly = formData.get("imageOnly") === "on" || placement === "HERO" || placement === "CATEGORY_ICON";
  const position = Number(formData.get("position") ?? 0);

  if (placement === "CATEGORY_ICON") {
    if (!categoryId) return { error: "Escolha a qual categoria esse ícone pertence." };
    if (!imageUrl) return { error: "O ícone de categoria precisa de uma imagem." };
  }
  if (placement === "HERO" && !imageUrl) {
    return { error: "O banner cheio precisa de uma imagem." };
  }
  if (imageOnly && !imageUrl) {
    return { error: "Envie uma imagem ou desmarque \"somente imagem\"." };
  }
  if (!imageOnly && !title) {
    return { error: "Informe um título (ou marque \"somente imagem\" e envie uma foto)." };
  }

  return {
    data: {
      title: title || null,
      subtitle: subtitle || null,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
      theme,
      placement,
      imageUrl: imageUrl || null,
      imageUrlMobile: placement === "HERO" ? imageUrlMobile || null : null,
      imageOnly,
      position,
      categoryId: placement === "CATEGORY_ICON" ? categoryId : null,
    },
  };
}

export async function createBanner(
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = parseBannerForm(formData);
  if ("error" in parsed) return parsed;

  await db.banner.create({ data: parsed.data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}

export async function updateBanner(
  id: string,
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  if (!(await requireAdmin())) return { error: "Não autorizado." };

  const parsed = parseBannerForm(formData);
  if ("error" in parsed) return parsed;

  await db.banner.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}

export async function toggleBanner(id: string, active: boolean) {
  if (!(await requireAdmin())) return;

  await db.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  if (!(await requireAdmin())) return;

  await db.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
}
