"use client";

import { useState } from "react";

export type VariantRow = { size: string; color: string; stock: number };

export function VariantEditor({ initial = [] }: { initial?: VariantRow[] }) {
  const [rows, setRows] = useState<VariantRow[]>(
    initial.length > 0 ? initial : [{ size: "", color: "", stock: 0 }]
  );

  function update(index: number, field: keyof VariantRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: field === "stock" ? Number(value) || 0 : value } : row
      )
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { size: "", color: "", stock: 0 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name="variantsJson" value={JSON.stringify(rows)} />

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_100px_36px] gap-2">
            <input
              placeholder="Tamanho (ex: M)"
              value={row.size}
              onChange={(e) => update(i, "size", e.target.value)}
              className="h-9 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            <input
              placeholder="Cor (ex: Preto)"
              value={row.color}
              onChange={(e) => update(i, "color", e.target.value)}
              className="h-9 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            <input
              type="number"
              min={0}
              placeholder="Estoque"
              value={row.stock}
              onChange={(e) => update(i, "stock", e.target.value)}
              className="h-9 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="h-9 rounded-lg border border-line text-text-faint hover:border-red hover:text-red"
              aria-label="Remover variação"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-xs font-semibold text-cyan hover:underline"
      >
        + adicionar variação
      </button>
    </div>
  );
}
