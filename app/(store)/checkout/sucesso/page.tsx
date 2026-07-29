import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, toNumber } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await auth();
  const { order: orderId } = await searchParams;

  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
    : null;

  if (order?.userId && order.userId !== session?.user?.id) {
    redirect(`/conta/login?callbackUrl=${encodeURIComponent(`/checkout/sucesso?order=${order.id}`)}`);
  }

  const isGuestOrder = Boolean(order && !order.userId);

  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center sm:px-7">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan/10 text-2xl text-cyan">
        ✓
      </div>
      <h1 className="mb-2 text-xl font-extrabold">Pedido confirmado</h1>
      <p className="mb-6 text-sm text-text-muted">
        {order
          ? `Pedido #${order.id.slice(-8)} recebido. Total: ${formatPrice(toNumber(order.total))}.`
          : "Seu pedido foi recebido."}
      </p>

      {isGuestOrder && order ? (
        <div className="mb-6 rounded-xl border border-line bg-surface p-4 text-left">
          <p className="mb-1 text-sm font-semibold">Guarde o número do seu pedido</p>
          <p className="mb-3 text-xs text-text-muted">
            Como você comprou sem login, use o número{" "}
            <span className="font-mono text-cyan">{order.id}</span> junto com seu e-mail pra
            consultar o status depois em{" "}
            <span className="font-semibold text-text">rastrear pedido</span>.
          </p>
          <LinkButton
            href={`/rastrear?pedido=${order.id}&email=${encodeURIComponent(order.guestEmail ?? "")}`}
            variant="surface"
            className="w-full"
          >
            ver status desse pedido
          </LinkButton>
        </div>
      ) : null}

      <div className="flex justify-center gap-3">
        {isGuestOrder ? null : (
          <LinkButton href="/conta/pedidos" variant="ghost">
            ver meus pedidos
          </LinkButton>
        )}
        <LinkButton href="/">continuar comprando</LinkButton>
      </div>

      {isGuestOrder && order ? (
        <div className="mt-8 rounded-xl border border-cyan/30 bg-cyan/5 p-4 text-left">
          <p className="mb-1 text-sm font-semibold text-cyan">Quer acompanhar seus pedidos mais fácil?</p>
          <p className="mb-3 text-xs text-text-muted">
            Crie uma conta com os dados que você já digitou — falta só a senha.
          </p>
          <LinkButton
            href={`/conta/registro?name=${encodeURIComponent(order.guestName ?? "")}&email=${encodeURIComponent(order.guestEmail ?? "")}&phone=${encodeURIComponent(order.guestPhone ?? "")}`}
            className="w-full"
          >
            criar conta
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}
