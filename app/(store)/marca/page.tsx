import Link from "next/link";
import { db } from "@/lib/db";

export default async function BrandsIndexPage() {
  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-extrabold">Marcas</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/marca/${b.slug}`}
            className="neon-interactive neon-lift rounded-xl border border-line bg-surface p-5"
          >
            <p className="mb-1 font-semibold">{b.name}</p>
            <p className="text-xs text-text-muted">
              {b._count.products} produto{b._count.products === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
