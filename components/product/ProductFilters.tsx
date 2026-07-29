import Link from "next/link";
import type { ParsedFilters } from "@/lib/product-filters";

export function ProductFilters({
  action,
  sizes,
  brands,
  filters,
  preserve = {},
}: {
  action: string;
  sizes: string[];
  brands?: { slug: string; name: string }[];
  filters: ParsedFilters;
  preserve?: Record<string, string | undefined>;
}) {
  const hasActiveFilters =
    filters.precoMin !== undefined ||
    filters.precoMax !== undefined ||
    filters.sizes.length > 0 ||
    filters.brands.length > 0;

  return (
    <form
      method="get"
      action={action}
      className="flex w-full flex-col gap-5 rounded-xl border border-line bg-surface p-4 sm:w-56 sm:shrink-0"
    >
      {Object.entries(preserve).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}
      <input type="hidden" name="ordenar" value={filters.sort} />

      <p className="text-sm font-bold uppercase tracking-wide text-text-faint">Filtros</p>

      <div>
        <p className="mb-2 text-xs font-semibold text-text-muted">Preço</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="precoMin"
            placeholder="De"
            min={0}
            defaultValue={filters.precoMin ?? ""}
            className="h-9 w-full min-w-0 rounded-lg border border-line bg-surface-2 px-2.5 text-sm focus:border-cyan focus:outline-none"
          />
          <span className="shrink-0 text-text-faint">–</span>
          <input
            type="number"
            name="precoMax"
            placeholder="Até"
            min={0}
            defaultValue={filters.precoMax ?? ""}
            className="h-9 w-full min-w-0 rounded-lg border border-line bg-surface-2 px-2.5 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
      </div>

      {brands && brands.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold text-text-muted">Marca</p>
          <div className="flex flex-col gap-1.5">
            {brands.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  name="marca"
                  value={brand.slug}
                  defaultChecked={filters.brands.includes(brand.slug)}
                  className="accent-cyan"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold text-text-muted">Tamanho</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <label key={size} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="tamanho"
                  value={size}
                  defaultChecked={filters.sizes.includes(size)}
                  className="peer sr-only"
                />
                <span className="neon-interactive block rounded-md border border-line px-3 py-1.5 text-sm text-text-muted peer-checked:border-cyan peer-checked:text-cyan peer-checked:shadow-[var(--glow-cyan-sm)]">
                  {size}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-2">
        <button
          type="submit"
          className="neon-interactive w-full rounded-lg bg-cyan px-4 py-2 text-sm font-bold text-cyan-ink shadow-[var(--glow-cyan-sm)] hover:shadow-[var(--glow-cyan-md)]"
        >
          filtrar
        </button>
        {hasActiveFilters ? (
          <Link href={action} className="text-xs text-text-faint hover:text-cyan">
            limpar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
