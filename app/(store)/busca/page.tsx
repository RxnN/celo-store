import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { toProductCardData } from "@/components/product/product-card-data";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SortSelect } from "@/components/product/SortSelect";
import { parseFilters, filtersToWhere, filtersToOrderBy } from "@/lib/product-filters";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    precoMin?: string;
    precoMax?: string;
    tamanho?: string | string[];
    marca?: string | string[];
    ordenar?: string;
  }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const filters = parseFilters(sp);

  const [availableSizes, allBrands] = await Promise.all([
    query
      ? db.productVariant.findMany({
          where: {
            product: {
              active: true,
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          select: { size: true },
          distinct: ["size"],
        })
      : Promise.resolve([]),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = query
    ? await db.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          ...filtersToWhere(filters),
        },
        include: {
          brand: true,
          variants: { select: { id: true, size: true, color: true, stock: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
        orderBy: filtersToOrderBy(filters),
      })
    : [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-extrabold">
        {query ? `Resultados para "${query}"` : "Buscar produtos"}
      </h1>
      <p className="mb-4 text-sm text-text-muted">
        {query
          ? `${products.length} produto${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`
          : "Digite algo na busca acima."}
      </p>

      {query ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ProductFilters
            action="/busca"
            sizes={availableSizes.map((v) => v.size).sort()}
            brands={allBrands}
            filters={filters}
            preserve={{ q: query }}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex justify-end">
              <SortSelect sort={filters.sort} />
            </div>
            <ProductGrid products={products.map(toProductCardData)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
