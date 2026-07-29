import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    include: { items: { include: { product: true, variant: true } }, coupon: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return <p className="text-sm text-text-muted">Você ainda não fez nenhum pedido.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Pedido #{order.id.slice(-8)}</span>
            <span className="text-xs font-bold uppercase tracking-wide text-cyan">
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <p className="mb-3 text-xs text-text-muted">
            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
          </p>

          <div className="mb-3 flex flex-col gap-2 border-t border-line pt-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-text-muted">
                  {item.quantity}x {item.product.name}{" "}
                  <span className="text-text-faint">
                    ({item.variant.size}/{item.variant.color})
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatPrice(toNumber(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {order.trackingCode ? (
            <p className="mb-3 text-xs text-text-muted">
              Rastreio: <span className="font-mono text-cyan">{order.trackingCode}</span>
            </p>
          ) : null}

          <div className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(toNumber(order.subtotal))}</span>
            </div>
            {toNumber(order.discount) > 0 ? (
              <div className="flex justify-between text-green">
                <span>Cupom{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span className="tabular-nums">-{formatPrice(toNumber(order.discount))}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-text-muted">
              <span>Frete</span>
              <span className="tabular-nums">
                {toNumber(order.shipping) === 0 ? "Grátis" : formatPrice(toNumber(order.shipping))}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-base font-extrabold">
              <span>Total</span>
              <span className="tabular-nums text-cyan">{formatPrice(toNumber(order.total))}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
