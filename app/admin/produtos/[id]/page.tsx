import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands, subcategories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { variants: true, images: { orderBy: { position: "asc" } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.subcategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold">Editar produto</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        brands={brands}
        subcategories={subcategories}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          brandId: product.brandId,
          featured: product.featured,
          active: product.active,
          variants: product.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })),
          images: product.images.map((img) => img.url),
          weightGrams: product.weightGrams,
          heightCm: product.heightCm,
          widthCm: product.widthCm,
          lengthCm: product.lengthCm,
        }}
      />
    </div>
  );
}
