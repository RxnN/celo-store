import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { BrandRow } from "@/components/admin/BrandRow";
import { createBrand } from "./actions";

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-extrabold">Marcas</h1>

      <form action={createBrand} className="mb-8 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nome</label>
          <input
            name="name"
            required
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Slug</label>
          <input
            name="slug"
            required
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <Button type="submit">adicionar</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <BrandRow key={b.id} brand={b} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
