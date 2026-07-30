"use client";

import { useState } from "react";
import { DeleteButton } from "./DeleteButton";
import { updateSubcategory, deleteSubcategory } from "@/app/admin/subcategorias/actions";
import { useAdminToastStore } from "@/lib/admin-toast-store";

export function SubcategoryRow({
  subcategory,
  categories,
}: {
  subcategory: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    category: { name: string };
    _count: { products: number };
  };
  categories: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const showToast = useAdminToastStore((s) => s.show);

  if (editing) {
    return (
      <tr className="border-b border-line last:border-0">
        <td colSpan={5} className="px-4 py-3">
          <form
            action={async (formData) => {
              await updateSubcategory(formData);
              showToast("Subcategoria salva com sucesso!");
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="id" value={subcategory.id} />
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">
                Categoria
              </label>
              <select
                name="categoryId"
                required
                defaultValue={subcategory.categoryId}
                className="h-9 w-36 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Nome</label>
              <input
                name="name"
                required
                defaultValue={subcategory.name}
                className="h-9 w-36 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Slug</label>
              <input
                name="slug"
                required
                defaultValue={subcategory.slug}
                className="h-9 w-36 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
              />
            </div>
            <button type="submit" className="text-xs font-bold text-green hover:underline">
              salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-text-faint hover:text-text"
            >
              cancelar
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-text-muted">{subcategory.category.name}</td>
      <td className="px-4 py-3 font-medium">{subcategory.name}</td>
      <td className="px-4 py-3 text-text-muted">{subcategory.slug}</td>
      <td className="px-4 py-3 tabular-nums">{subcategory._count.products}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-cyan hover:underline"
          >
            editar
          </button>
          <DeleteButton action={deleteSubcategory.bind(null, subcategory.id)} />
        </div>
      </td>
    </tr>
  );
}
