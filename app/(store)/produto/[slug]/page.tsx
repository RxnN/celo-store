import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductDetail } from "@/components/product/ProductDetail";
import { UpsellGrid } from "@/components/product/UpsellGrid";
import { toProductCardData } from "@/components/product/product-card-data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, active: true },
    include: {
      brand: true,
      category: true,
      variants: { orderBy: { size: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) notFound();

  const relatedProducts = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    include: {
      brand: true,
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <nav className="mb-6 text-xs text-text-faint">
        <Link href="/" className="hover:text-text-muted">
          início
        </Link>{" "}
        /{" "}
        <Link href={`/categoria/${product.category.slug}`} className="hover:text-text-muted">
          {product.category.name}
        </Link>{" "}
        / <span className="text-text-muted">{product.name}</span>
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          brand: product.brand ? { name: product.brand.name } : null,
          category: { name: product.category.name, slug: product.category.slug },
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
          })),
          images: product.images.map((img) => img.url),
        }}
      />

      <UpsellGrid title="Você também pode gostar" products={relatedProducts.map(toProductCardData)} />
    </div>
  );
}
