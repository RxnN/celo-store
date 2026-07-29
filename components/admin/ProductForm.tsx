"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { VariantEditor, VariantRow } from "./VariantEditor";
import { MultiImageUploader } from "./MultiImageUploader";
import { ProductFormState } from "@/app/admin/produtos/actions";

type Option = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; categoryId: string };

export function ProductForm({
  action,
  categories,
  brands,
  subcategories,
  initial,
}: {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Option[];
  brands: Option[];
  subcategories: SubcategoryOption[];
  initial?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    categoryId: string;
    subcategoryId: string | null;
    brandId: string | null;
    featured: boolean;
    active: boolean;
    variants: VariantRow[];
    images: string[];
    weightGrams: number | null;
    heightCm: number | null;
    widthCm: number | null;
    lengthCm: number | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nome</label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">
          Slug (URL, ex: camiseta-performance-dry)
        </label>
        <input
          name="slug"
          required
          defaultValue={initial?.slug}
          className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">Descrição</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={initial?.description}
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Preço (R$)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initial?.price}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            Preço &ldquo;de&rdquo; (opcional)
          </label>
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.compareAtPrice ?? ""}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Categoria</label>
          <select
            name="categoryId"
            required
            defaultValue={initial?.categoryId}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          >
            <option value="">selecione</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            Marca (opcional)
          </label>
          <select
            name="brandId"
            defaultValue={initial?.brandId ?? ""}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          >
            <option value="">sem marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">
          Subcategoria (opcional)
        </label>
        <select
          name="subcategoryId"
          defaultValue={initial?.subcategoryId ?? ""}
          className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        >
          <option value="">sem subcategoria</option>
          {categories.map((c) => {
            const opts = subcategories.filter((s) => s.categoryId === c.id);
            if (opts.length === 0) return null;
            return (
              <optgroup key={c.id} label={c.name}>
                {opts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div className="flex gap-6 text-sm text-text-muted">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} />
          Destaque
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial ? initial.active : true}
          />
          Ativo (visível na loja)
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">
          Variações (tamanho, cor, estoque)
        </label>
        <VariantEditor initial={initial?.variants} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">Fotos</label>
        <MultiImageUploader initial={initial?.images} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">
          Peso e dimensões (opcional — usado pra calcular o frete automaticamente)
        </label>
        <div className="grid grid-cols-4 gap-3">
          <input
            name="weightGrams"
            type="number"
            min="0"
            placeholder="Peso (g)"
            defaultValue={initial?.weightGrams ?? ""}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
          <input
            name="heightCm"
            type="number"
            min="0"
            placeholder="Altura (cm)"
            defaultValue={initial?.heightCm ?? ""}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
          <input
            name="widthCm"
            type="number"
            min="0"
            placeholder="Largura (cm)"
            defaultValue={initial?.widthCm ?? ""}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
          <input
            name="lengthCm"
            type="number"
            min="0"
            placeholder="Comprimento (cm)"
            defaultValue={initial?.lengthCm ?? ""}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending ? "salvando..." : "salvar produto"}
      </Button>
    </form>
  );
}
