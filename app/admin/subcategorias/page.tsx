import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { SubcategoryRow } from "@/components/admin/SubcategoryRow";
import { createSubcategory } from "./actions";

export default async function AdminSubcategoriesPage() {
  const [subcategories, categories] = await Promise.all([
    db.subcategory.findMany({
      include: { category: true, _count: { select: { products: true } } },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-extrabold">Subcategorias</h1>
      <p className="mb-6 text-sm text-text-muted">
        Aparecem no dropdown do menu de cada categoria, na loja.
      </p>

      <form action={createSubcategory} className="mb-8 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Categoria</label>
          <select
            name="categoryId"
            required
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nome</label>
          <input
            name="name"
            required
            placeholder="ex: Regata"
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Slug</label>
          <input
            name="slug"
            required
            placeholder="ex: regata"
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <Button type="submit">adicionar</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Subcategoria</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((s) => (
              <SubcategoryRow key={s.id} subcategory={s} categories={categories} />
            ))}
            {subcategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Nenhuma subcategoria ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
