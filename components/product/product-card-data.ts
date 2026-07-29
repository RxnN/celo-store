export type ProductCardVariant = { id: string; size: string; color: string; stock: number };

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  compareAtPrice: string | number | null;
  createdAt: Date;
  brand: { name: string } | null;
  variants: ProductCardVariant[];
  image: string | null;
};

export function toProductCardData<
  T extends {
    id: string;
    slug: string;
    name: string;
    price: unknown;
    compareAtPrice: unknown;
    createdAt: Date;
    brand: { name: string } | null;
    variants: ProductCardVariant[];
    images: { url: string }[];
  }
>(product: T): ProductCardData {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    image: product.images[0]?.url ?? null,
  };
}
