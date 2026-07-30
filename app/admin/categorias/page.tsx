import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-extrabold">Categorias</h1>

      <form action={createCategory} className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
        </div>
        <ImageUploader
          name="imageUrl"
          label="Ícone (bolinha da home)"
          hint="recomendado 200×200px, imagem quadrada"
        />
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
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
