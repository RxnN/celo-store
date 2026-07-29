import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import { ProductCardData } from "./ProductCard";

const DOT_CLASSES: Record<string, string> = {
  cyan: "bg-cyan",
  red: "bg-red",
  violet: "bg-violet",
};

const TITLE_CLASSES: Record<string, string> = {
  cyan: "text-cyan",
  red: "text-red",
  violet: "text-violet",
};

export function ProductSection({
  title,
  href,
  tone = "cyan",
  products,
}: {
  title: string;
  href: string;
  tone?: "cyan" | "red" | "violet";
  products: ProductCardData[];
}) {
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[tone]}`} />
        <h2 className={`font-display text-base uppercase tracking-wide ${TITLE_CLASSES[tone]}`}>
          {title}
        </h2>
        <Link href={href} className="ml-auto text-xs text-cyan hover:underline">
          ver tudo →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
