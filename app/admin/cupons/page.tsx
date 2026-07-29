import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CouponForm } from "@/components/admin/CouponForm";
import { toggleCoupon } from "./actions";

export default async function AdminCouponsPage() {
  const [coupons, products] = await Promise.all([
    db.coupon.findMany({ include: { product: true }, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-extrabold">Cupons</h1>
      <p className="mb-6 text-sm text-text-muted">
        Cupons de desconto que o cliente pode aplicar no checkout — sobre o valor total do pedido
        ou sobre um produto específico.
      </p>

      <CouponForm products={products} />

      <div className="flex flex-col gap-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div>
              <p className="font-semibold">{coupon.code}</p>
              <p className="text-xs text-text-muted">
                {coupon.type === "PERCENT" ? `${Number(coupon.value)}%` : formatPrice(Number(coupon.value))}
                {" · "}
                {coupon.scope === "ORDER_TOTAL"
                  ? "valor total do pedido"
                  : `produto: ${coupon.product?.name ?? "—"}`}
              </p>
            </div>
            <form action={toggleCoupon.bind(null, coupon.id, !coupon.active)}>
              <button
                type="submit"
                className={`text-xs font-bold ${coupon.active ? "text-green" : "text-text-faint"}`}
              >
                {coupon.active ? "ativo" : "inativo"}
              </button>
            </form>
          </div>
        ))}
        {coupons.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum cupom cadastrado ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
