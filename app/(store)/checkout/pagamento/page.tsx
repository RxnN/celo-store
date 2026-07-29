import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { PaymentConfirmButton } from "@/components/checkout/PaymentConfirmButton";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await auth();

  const { order: orderId } = await searchParams;
  const order = orderId
    ? await db.order.findUnique({ where: { id: orderId } })
    : null;

  if (!order) notFound();

  const isOwner = order.userId ? order.userId === session?.user?.id : true;
  if (!isOwner) {
    redirect(`/conta/login?callbackUrl=${encodeURIComponent(`/checkout/pagamento?order=${order.id}`)}`);
  }

  if (order.status !== "PENDING") {
    redirect(`/checkout/sucesso?order=${order.id}`);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-7">
      <h1 className="mb-1 text-xl font-extrabold">Pagamento</h1>
      <p className="mb-6 text-sm text-text-muted">Pedido #{order.id.slice(-8)}</p>

      <div className="mb-6 rounded-xl border border-line bg-surface p-5">
        <p className="mb-4 rounded-lg border border-amber/30 bg-amber/10 px-3 py-2 text-xs text-amber">
          Ambiente de testes — o Mercado Pago ainda não está configurado nesta loja. Clique
          abaixo pra simular o pagamento aprovado.
        </p>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(toNumber(order.subtotal))}</span>
          </div>
          {toNumber(order.discount) > 0 ? (
            <div className="flex justify-between text-green">
              <span>Cupom</span>
              <span className="tabular-nums">-{formatPrice(toNumber(order.discount))}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-text-muted">
            <span>Frete</span>
            <span className="tabular-nums">
              {toNumber(order.shipping) === 0 ? "Grátis" : formatPrice(toNumber(order.shipping))}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 text-base font-extrabold">
            <span>Total</span>
            <span className="tabular-nums text-cyan">{formatPrice(toNumber(order.total))}</span>
          </div>
        </div>
      </div>

      <PaymentConfirmButton orderId={order.id} />
    </div>
  );
}
