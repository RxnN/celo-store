"use client";

import { useState } from "react";
import { DeleteButton } from "./DeleteButton";
import { updateCategory, deleteCategory } from "@/app/admin/categorias/actions";

export function CategoryRow({
  category,
}: {
  category: { id: string; name: string; slug: string; _count: { products: number } };
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-line last:border-0">
        <td colSpan={4} className="px-4 py-3">
          <form
            action={async (formData) => {
              await updateCategory(formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="id" value={category.id} />
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Nome</label>
              <input
                name="name"
                required
                defaultValue={category.name}
                className="h-9 w-40 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Slug</label>
              <input
                name="slug"
                required
                defaultValue={category.slug}
                className="h-9 w-40 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
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
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="px-4 py-3 text-text-muted">{category.slug}</td>
      <td className="px-4 py-3 tabular-nums">{category._count.products}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-cyan hover:underline"
          >
            editar
          </button>
          <DeleteButton action={deleteCategory.bind(null, category.id)} />
        </div>
      </td>
    </tr>
  );
}
