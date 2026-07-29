import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { updateOrderStatus } from "./actions";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold">Pedidos</h1>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/pedidos/${order.id}`} className="hover:text-cyan">
                    #{order.id.slice(-8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {order.user?.name ?? order.guestName}
                  {order.user ? null : (
                    <span className="ml-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase text-text-faint">
                      convidado
                    </span>
                  )}
                  <br />
                  <span className="text-xs text-text-faint">
                    {order.user?.email ?? order.guestEmail}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{order.items.length}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(toNumber(order.total))}</td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusForm
                    orderId={order.id}
                    status={order.status}
                    trackingCode={order.trackingCode}
                    action={updateOrderStatus}
                  />
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Nenhum pedido ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
