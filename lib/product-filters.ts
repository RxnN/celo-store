import type { Prisma } from "@prisma/client";

export type ParsedFilters = {
  precoMin?: number;
  precoMax?: number;
  sizes: string[];
  brands: string[];
  sort: string;
};

export type RawFilterParams = {
  precoMin?: string;
  precoMax?: string;
  tamanho?: string | string[];
  marca?: string | string[];
  ordenar?: string;
};

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseFilters(params: RawFilterParams): ParsedFilters {
  const precoMin = params.precoMin ? Number(params.precoMin) : undefined;
  const precoMax = params.precoMax ? Number(params.precoMax) : undefined;
  const sort = params.ordenar ?? "novos";

  return {
    precoMin: precoMin !== undefined && !Number.isNaN(precoMin) ? precoMin : undefined,
    precoMax: precoMax !== undefined && !Number.isNaN(precoMax) ? precoMax : undefined,
    sizes: toArray(params.tamanho),
    brands: toArray(params.marca),
    sort,
  };
}

export function filtersToWhere(filters: ParsedFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.precoMin !== undefined || filters.precoMax !== undefined) {
    where.price = {
      ...(filters.precoMin !== undefined ? { gte: filters.precoMin } : {}),
      ...(filters.precoMax !== undefined ? { lte: filters.precoMax } : {}),
    };
  }

  if (filters.sizes.length > 0) {
    where.variants = { some: { size: { in: filters.sizes } } };
  }

  if (filters.brands.length > 0) {
    where.brand = { slug: { in: filters.brands } };
  }

  return where;
}

export function filtersToOrderBy(filters: ParsedFilters): Prisma.ProductOrderByWithRelationInput {
  switch (filters.sort) {
    case "antigos":
      return { createdAt: "asc" };
    case "menor-preco":
      return { price: "asc" };
    case "maior-preco":
      return { price: "desc" };
    case "az":
      return { name: "asc" };
    case "za":
      return { name: "desc" };
    case "novos":
    default:
      return { createdAt: "desc" };
  }
}
