import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { SavedToastFromQuery } from "@/components/admin/SavedToastFromQuery";
import { toggleProduct } from "./actions";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true, brand: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SavedToastFromQuery message="Produto salvo com sucesso!" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Produtos</h1>
        <LinkButton href="/admin/produtos/novo">+ novo produto</LinkButton>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/produtos/${p.id}`} className="hover:text-cyan">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.category.name}</td>
                  <td className="px-4 py-3 text-text-muted">{p.brand?.name ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(toNumber(p.price))}</td>
                  <td className="px-4 py-3 tabular-nums">{totalStock}</td>
                  <td className="px-4 py-3">
                    <form action={toggleProduct.bind(null, p.id, !p.active)}>
                      <button
                        type="submit"
                        className={`text-xs font-bold ${p.active ? "text-green" : "text-text-faint"}`}
                      >
                        {p.active ? "ativo" : "inativo"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
