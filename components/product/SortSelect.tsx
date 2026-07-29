"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "novos", label: "Mais novos" },
  { value: "antigos", label: "Mais antigos" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
];

export function SortSelect({ sort }: { sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ordenar", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={sort}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Ordenar produtos"
      className="neon-interactive h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-xs font-semibold text-text-muted focus:border-cyan focus:outline-none"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
