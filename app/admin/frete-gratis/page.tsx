import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FreeShippingForm } from "@/components/admin/FreeShippingForm";
import { toggleFreeShippingRule, deleteFreeShippingRule } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  MIN_VALUE: "valor mínimo",
  MIN_QUANTITY: "quantidade mínima",
  SPECIFIC_PRODUCT: "produto específico",
};

export default async function AdminFreeShippingPage() {
  const [rules, products] = await Promise.all([
    db.freeShippingRule.findMany({ include: { product: true }, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-extrabold">Frete grátis</h1>
      <p className="mb-6 text-sm text-text-muted">
        Se qualquer regra ativa valer pro carrinho do cliente, o frete fica grátis.
      </p>

      <FreeShippingForm products={products} />

      <div className="flex flex-col gap-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div>
              <p className="font-semibold">{rule.label}</p>
              <p className="text-xs text-text-muted">
                {TYPE_LABEL[rule.type]}
                {rule.type === "MIN_VALUE" && rule.minValue
                  ? ` · a partir de ${formatPrice(Number(rule.minValue))}`
                  : ""}
                {rule.type === "MIN_QUANTITY" && rule.minQuantity
                  ? ` · a partir de ${rule.minQuantity} item(ns)`
                  : ""}
                {rule.type === "SPECIFIC_PRODUCT" && rule.product ? ` · ${rule.product.name}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <form action={toggleFreeShippingRule.bind(null, rule.id, !rule.active)}>
                <button
                  type="submit"
                  className={`text-xs font-bold ${rule.active ? "text-green" : "text-text-faint"}`}
                >
                  {rule.active ? "ativa" : "inativa"}
                </button>
              </form>
              <DeleteButton action={deleteFreeShippingRule.bind(null, rule.id)} />
            </div>
          </div>
        ))}
        {rules.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma regra cadastrada ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
