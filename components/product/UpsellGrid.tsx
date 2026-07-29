import { ProductCard } from "./ProductCard";
import { ProductCardData } from "./product-card-data";

export function UpsellGrid({ title, products }: { title: string; products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-cyan shadow-[var(--glow-cyan-sm)]" />
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-cyan">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
