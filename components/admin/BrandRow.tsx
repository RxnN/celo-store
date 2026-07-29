"use client";

import { useState } from "react";
import { DeleteButton } from "./DeleteButton";
import { updateBrand, deleteBrand } from "@/app/admin/marcas/actions";

export function BrandRow({
  brand,
}: {
  brand: { id: string; name: string; slug: string; _count: { products: number } };
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-line last:border-0">
        <td colSpan={4} className="px-4 py-3">
          <form
            action={async (formData) => {
              await updateBrand(formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="id" value={brand.id} />
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Nome</label>
              <input
                name="name"
                required
                defaultValue={brand.name}
                className="h-9 w-40 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-muted">Slug</label>
              <input
                name="slug"
                required
                defaultValue={brand.slug}
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
      <td className="px-4 py-3 font-medium">{brand.name}</td>
      <td className="px-4 py-3 text-text-muted">{brand.slug}</td>
      <td className="px-4 py-3 tabular-nums">{brand._count.products}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-cyan hover:underline"
          >
            editar
          </button>
          <DeleteButton action={deleteBrand.bind(null, brand.id)} />
        </div>
      </td>
    </tr>
  );
}
