import { db } from "@/lib/db";
import { BannerForm } from "@/components/admin/BannerForm";
import { BannerRow } from "@/components/admin/BannerRow";
import { createBanner } from "./actions";

export default async function AdminBannersPage() {
  const [banners, categories] = await Promise.all([
    db.banner.findMany({ orderBy: [{ placement: "asc" }, { position: "asc" }], include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-xl font-extrabold">Promoções</h1>
      <p className="mb-6 text-sm text-text-muted">
        Escolha se a promoção aparece como card na home, como slide no carrossel de destaques,
        como banner cheio no topo (com foto trocando sozinha a cada 3s), ou como ícone de categoria
        (bolinha da home).
      </p>

      <BannerForm categories={categories} action={createBanner} />

      <div className="flex flex-col gap-3">
        {banners.map((b) => (
          <BannerRow key={b.id} banner={b} categories={categories} />
        ))}
        {banners.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma promoção cadastrada ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
