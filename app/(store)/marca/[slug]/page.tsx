import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { toProductCardData } from "@/components/product/product-card-data";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SortSelect } from "@/components/product/SortSelect";
import { parseFilters, filtersToWhere, filtersToOrderBy } from "@/lib/product-filters";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    precoMin?: string;
    precoMax?: string;
    tamanho?: string | string[];
    ordenar?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const brand = await db.brand.findUnique({ where: { slug } });
  if (!brand) notFound();

  const availableSizes = await db.productVariant.findMany({
    where: { product: { brandId: brand.id, active: true } },
    select: { size: true },
    distinct: ["size"],
  });

  const filters = parseFilters(sp);

  const products = await db.product.findMany({
    where: {
      active: true,
      brandId: brand.id,
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
      <h1 className="mb-1 text-xl font-extrabold">{brand.name}</h1>
      <p className="mb-4 text-sm text-text-muted">
        {products.length} produto{products.length === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProductFilters
          action={`/marca/${slug}`}
          sizes={availableSizes.map((v) => v.size).sort()}
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
