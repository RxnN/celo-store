"use client";

import { useState } from "react";
import Image from "next/image";
import { DeleteButton } from "./DeleteButton";
import { BannerForm } from "./BannerForm";
import { toggleBanner, deleteBanner, updateBanner } from "@/app/admin/banners/actions";

const PLACEMENT_LABEL: Record<string, string> = {
  CARD: "card (linha de promoções)",
  CAROUSEL: "carrossel (slide de destaques)",
  HERO: "banner cheio (topo, auto-rotativo)",
  CATEGORY_ICON: "ícone de categoria (bolinha da home)",
};

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  theme: string;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  imageOnly: boolean;
  placement: string;
  position: number;
  active: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

export function BannerRow({
  banner: b,
  categories,
}: {
  banner: Banner;
  categories: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4">
        <BannerForm
          categories={categories}
          action={updateBanner.bind(null, b.id)}
          submitLabel="salvar"
          onSuccess={() => setEditing(false)}
          defaultValues={{
            placement: b.placement,
            theme: b.theme,
            position: b.position,
            imageUrl: b.imageUrl,
            imageUrlMobile: b.imageUrlMobile,
            imageOnly: b.imageOnly,
            title: b.title,
            subtitle: b.subtitle,
            ctaLabel: b.ctaLabel,
            ctaHref: b.ctaHref,
            categoryId: b.categoryId,
          }}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-text-faint hover:text-text"
        >
          cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        {b.imageUrl ? (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
            <Image src={b.imageUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div>
          <p className="font-semibold">
            {b.category ? b.category.name : b.title || <span className="text-text-faint">(sem título)</span>}
          </p>
          <p className="text-xs text-text-muted">
            {PLACEMENT_LABEL[b.placement]}
            {b.placement !== "CATEGORY_ICON" ? ` · tema ${b.theme}` : ""}
            {b.imageOnly && b.placement !== "HERO" && b.placement !== "CATEGORY_ICON" ? " · só imagem" : ""}
            {b.imageUrlMobile ? " · com versão mobile" : ""}
            {b.ctaLabel ? ` · ${b.ctaLabel}` : ""}
            {b.ctaHref ? ` → ${b.ctaHref}` : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-cyan hover:underline"
        >
          editar
        </button>
        <form action={toggleBanner.bind(null, b.id, !b.active)}>
          <button
            type="submit"
            className={`text-xs font-bold ${b.active ? "text-green" : "text-text-faint"}`}
          >
            {b.active ? "ativo" : "inativo"}
          </button>
        </form>
        <DeleteButton action={deleteBanner.bind(null, b.id)} />
      </div>
    </div>
  );
}
