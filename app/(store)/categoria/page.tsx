import Link from "next/link";
import { db } from "@/lib/db";

export default async function CategoriesIndexPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-extrabold">Categorias</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="neon-interactive neon-lift rounded-xl border border-line bg-surface p-5"
          >
            <p className="mb-1 font-semibold">{c.name}</p>
            <p className="text-xs text-text-muted">
              {c._count.products} produto{c._count.products === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
