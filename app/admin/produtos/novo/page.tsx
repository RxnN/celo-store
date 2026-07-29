import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [categories, brands, subcategories] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.subcategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold">Novo produto</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        brands={brands}
        subcategories={subcategories}
      />
    </div>
  );
}
