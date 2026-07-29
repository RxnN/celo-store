import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";
import { toProductCardData } from "@/components/product/product-card-data";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SortSelect } from "@/components/product/SortSelect";
import { parseFilters, filtersToWhere, filtersToOrderBy } from "@/lib/product-filters";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    marca?: string | string[];
    subcategoria?: string;
    precoMin?: string;
    precoMax?: string;
    tamanho?: string | string[];
    ordenar?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const filters = parseFilters(sp);

  const [activeBrands, activeSubcategory, availableSizes, allBrands] = await Promise.all([
    filters.brands.length > 0
      ? db.brand.findMany({ where: { slug: { in: filters.brands } } })
      : Promise.resolve([]),
    sp.subcategoria
      ? db.subcategory.findUnique({
          where: { categoryId_slug: { categoryId: category.id, slug: sp.subcategoria } },
        })
      : null,
    db.productVariant.findMany({
      where: { product: { categoryId: category.id, active: true } },
      select: { size: true },
      distinct: ["size"],
    }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = await db.product.findMany({
    where: {
      active: true,
      categoryId: category.id,
      ...(activeSubcategory ? { subcategoryId: activeSubcategory.id } : {}),
      ...filtersToWhere(filters),
    },
    include: {
      brand: true,
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: filtersToOrderBy(filters),
  });

  const otherBrandSlugs = (exclude: string) => filters.brands.filter((b) => b !== exclude);
  const buildUrl = (brandSlugs: string[]) => {
    const params = new URLSearchParams();
    if (sp.subcategoria) params.set("subcategoria", sp.subcategoria);
    brandSlugs.forEach((b) => params.append("marca", b));
    const qs = params.toString();
    return `/categoria/${slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-extrabold">{category.name}</h1>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <span>
          {products.length} produto{products.length === 1 ? "" : "s"}
        </span>
        {activeSubcategory ? (
          <span className="flex items-center gap-1.5 rounded-full border border-cyan px-3 py-1 text-xs text-cyan">
            {activeSubcategory.name}
            <Link
              href={buildUrl(filters.brands)}
              aria-label="Remover filtro de subcategoria"
              className="hover:text-white"
            >
              ✕
            </Link>
          </span>
        ) : null}
        {activeBrands.map((brand) => (
          <span
            key={brand.id}
            className="flex items-center gap-1.5 rounded-full border border-cyan px-3 py-1 text-xs text-cyan"
          >
            {brand.name}
            <Link
              href={buildUrl(otherBrandSlugs(brand.slug))}
              aria-label={`Remover filtro de ${brand.name}`}
              className="hover:text-white"
            >
              ✕
            </Link>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProductFilters
          action={`/categoria/${slug}`}
          sizes={availableSizes.map((v) => v.size).sort()}
          brands={allBrands}
          filters={filters}
          preserve={{ subcategoria: sp.subcategoria }}
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
