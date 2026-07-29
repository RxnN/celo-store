import Image from "next/image";
import { db } from "@/lib/db";
import { BannerForm } from "@/components/admin/BannerForm";
import { toggleBanner } from "./actions";

const PLACEMENT_LABEL: Record<string, string> = {
  CARD: "card (linha de promoções)",
  CAROUSEL: "carrossel (slide de destaques)",
  HERO: "banner cheio (topo, auto-rotativo)",
};

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: [{ placement: "asc" }, { position: "asc" }] });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-xl font-extrabold">Promoções</h1>
      <p className="mb-6 text-sm text-text-muted">
        Escolha se a promoção aparece como card na home, como slide no carrossel de destaques, ou
        como banner cheio no topo (com foto trocando sozinha a cada 3s).
      </p>

      <BannerForm />

      <div className="flex flex-col gap-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              {b.imageUrl ? (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
                  <Image src={b.imageUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div>
                <p className="font-semibold">{b.title || <span className="text-text-faint">(sem título)</span>}</p>
                <p className="text-xs text-text-muted">
                  {PLACEMENT_LABEL[b.placement]} · tema {b.theme}
                  {b.imageOnly ? " · só imagem" : ""}
                  {b.ctaLabel ? ` · ${b.ctaLabel}` : ""}
                  {b.ctaHref ? ` → ${b.ctaHref}` : ""}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <form action={toggleBanner.bind(null, b.id, !b.active)}>
                <button
                  type="submit"
                  className={`text-xs font-bold ${b.active ? "text-green" : "text-text-faint"}`}
                >
                  {b.active ? "ativo" : "inativo"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {banners.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma promoção cadastrada ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
