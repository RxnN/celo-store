import { db } from "@/lib/db";
import { HeroBrand } from "@/components/home/HeroBrand";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryShortcuts, CategoryShortcut } from "@/components/home/CategoryShortcuts";
import { PromoBanners } from "@/components/home/PromoBanners";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { ProductSection } from "@/components/product/ProductSection";
import { toProductCardData, ProductCardData } from "@/components/product/product-card-data";

const SECTIONS: { categorySlug: string; title: string; tone: "cyan" | "red" | "violet" }[] = [
  { categorySlug: "camisetas", title: "camisetas", tone: "cyan" },
  { categorySlug: "bermudas-shorts", title: "bermudas & shorts", tone: "red" },
  { categorySlug: "casacos-conjuntos", title: "casacos & conjuntos", tone: "violet" },
];
const PER_SECTION = 3;

async function getSectionsData() {
  const slugs = SECTIONS.map((s) => s.categorySlug);
  const products = await db.product.findMany({
    where: { active: true, category: { slug: { in: slugs } } },
    include: {
      brand: true,
      category: { select: { slug: true } },
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: slugs.length * PER_SECTION * 4,
  });

  const bySlug = new Map<string, ProductCardData[]>();
  for (const product of products) {
    const slug = product.category.slug;
    const bucket = bySlug.get(slug) ?? [];
    if (bucket.length < PER_SECTION) {
      bucket.push(toProductCardData(product));
      bySlug.set(slug, bucket);
    }
  }

  return SECTIONS.map((s) => ({ ...s, products: bySlug.get(s.categorySlug) ?? [] }));
}

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    where: { active: true, featured: true },
    include: {
      brand: true,
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return products.map(toProductCardData);
}

async function getBanners() {
  return db.banner.findMany({
    where: { active: true },
    orderBy: [{ placement: "asc" }, { position: "asc" }],
  });
}

async function getCategoryShortcuts(): Promise<CategoryShortcut[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { active: true },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: c.products[0]?.images[0]?.url ?? null,
  }));
}

export default async function HomePage() {
  const [sectionsData, featuredProducts, banners, categoryShortcuts] = await Promise.all([
    getSectionsData(),
    getFeaturedProducts(),
    getBanners(),
    getCategoryShortcuts(),
  ]);

  const cardBanners = banners.filter((b) => b.placement === "CARD");
  const carouselPromos = banners.filter((b) => b.placement === "CAROUSEL");
  const heroBanners = banners.filter((b) => b.placement === "HERO");

  return (
    <>
      <HeroCarousel banners={heroBanners} />
      <div className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6">
        <HeroBrand />
        <CategoryShortcuts categories={categoryShortcuts} />
        <PromoBanners banners={cardBanners} />
        <FeaturedCarousel promos={carouselPromos} products={featuredProducts} />

        {sectionsData.map((section) => (
          <ProductSection
            key={section.categorySlug}
            title={section.title}
            tone={section.tone}
            href={`/categoria/${section.categorySlug}`}
            products={section.products}
          />
        ))}
      </div>
    </>
  );
}
