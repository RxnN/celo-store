import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { toProductCardData } from "@/components/product/product-card-data";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SortSelect } from "@/components/product/SortSelect";
import { parseFilters, filtersToWhere, filtersToOrderBy } from "@/lib/product-filters";

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{
    precoMin?: string;
    precoMax?: string;
    tamanho?: string | string[];
    marca?: string | string[];
    ordenar?: string;
  }>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [availableSizes, allBrands] = await Promise.all([
    db.productVariant.findMany({
      where: { product: { active: true, compareAtPrice: { not: null } } },
      select: { size: true },
      distinct: ["size"],
    }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = await db.product.findMany({
    where: {
      active: true,
      compareAtPrice: { not: null },
      ...filtersToWhere(filters),
    },
    include: {
      brand: true,
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: filtersToOrderBy(filters),
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-extrabold">Ofertas</h1>
      <p className="mb-4 text-sm text-text-muted">
        {products.length} produto{products.length === 1 ? "" : "s"} em promoção
      </p>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProductFilters
          action="/ofertas"
          sizes={availableSizes.map((v) => v.size).sort()}
          brands={allBrands}
          filters={filters}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex justify-end">
            <SortSelect sort={filters.sort} />
          </div>
          <ProductGrid products={products.map(toProductCardData)} />
        </div>
      </div>
    </div>
  );
}
