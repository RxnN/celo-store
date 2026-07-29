import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { updateOrderStatus } from "../actions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: { include: { product: true, variant: true } },
      coupon: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pedidos" className="mb-4 inline-block text-xs text-text-faint hover:text-cyan">
        ← todos os pedidos
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Pedido #{order.id.slice(-8)}</h1>
          <p className="text-sm text-text-muted">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <OrderStatusForm
          orderId={order.id}
          status={order.status}
          trackingCode={order.trackingCode}
          action={updateOrderStatus}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-faint">
            Cliente
            {order.user ? null : (
              <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase text-text-faint">
                convidado
              </span>
            )}
          </p>
          <p className="text-sm font-semibold">{order.user?.name ?? order.guestName}</p>
          <p className="text-sm text-text-muted">{order.user?.email ?? order.guestEmail}</p>
          <p className="text-sm text-text-muted">{order.address.phone}</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-faint">
            Endereço de entrega
          </p>
          <p className="text-sm">{order.address.recipient}</p>
          <p className="text-sm text-text-muted">
            {order.address.street}, {order.address.number}
            {order.address.complement ? ` – ${order.address.complement}` : ""}
          </p>
          <p className="text-sm text-text-muted">
            {order.address.neighborhood} · {order.address.city}/{order.address.state}
          </p>
          <p className="text-sm text-text-muted">CEP {order.address.zip}</p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Variação</th>
              <th className="px-4 py-3">Qtd</th>
              <th className="px-4 py-3">Preço unit.</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{item.product.name}</td>
                <td className="px-4 py-3 text-text-muted">
                  {item.variant.size} / {item.variant.color}
                </td>
                <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(toNumber(item.unitPrice))}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(toNumber(item.unitPrice) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto flex max-w-[240px] flex-col gap-1.5 text-sm">
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
          <span className="tabular-nums">{formatPrice(toNumber(order.shipping))}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-1.5 text-base font-extrabold">
          <span>Total</span>
          <span className="tabular-nums text-cyan">{formatPrice(toNumber(order.total))}</span>
        </div>
      </div>
    </div>
  );
}
