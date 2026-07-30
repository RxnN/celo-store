import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProductCardData } from "@/components/product/product-card-data";
import { withApiLogging } from "@/lib/api-handler";

async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeIds = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (excludeIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const sourceProducts = await db.product.findMany({
    where: { id: { in: excludeIds } },
    select: { categoryId: true },
  });

  const categoryIds = Array.from(new Set(sourceProducts.map((p) => p.categoryId)));

  if (categoryIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: {
      active: true,
      categoryId: { in: categoryIds },
      id: { notIn: excludeIds },
    },
    include: {
      brand: true,
      variants: { select: { id: true, size: true, color: true, stock: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return NextResponse.json({ products: products.map(toProductCardData) });
}

export const GET = withApiLogging(handleGET);
