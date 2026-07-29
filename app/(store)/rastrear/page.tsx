"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { trackOrder, TrackOrderState } from "./actions";

const initialState: TrackOrderState = {};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(trackOrder, initialState);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Rastrear pedido</h1>
      <p className="mb-6 text-sm text-text-muted">
        Digite o número do pedido e o e-mail usado na compra pra ver o status.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            Número do pedido
          </label>
          <input
            name="orderId"
            required
            defaultValue={searchParams.get("pedido") ?? ""}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">E-mail</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={searchParams.get("email") ?? ""}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />
        <input type="hidden" name="cfTurnstileToken" value={turnstileToken ?? ""} />

        {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

        <Button
          type="submit"
          disabled={pending || (turnstileEnabled && !turnstileToken)}
          className="mt-2"
        >
          {pending ? "consultando..." : "consultar pedido"}
        </Button>
      </form>

      {state.order ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Pedido #{state.order.id.slice(-8)}</span>
            <span className="text-xs font-bold uppercase tracking-wide text-cyan">
              {ORDER_STATUS_LABEL[state.order.status] ?? state.order.status}
            </span>
          </div>
          <p className="mb-2 text-xs text-text-muted">
            {new Date(state.order.createdAt).toLocaleDateString("pt-BR")}
          </p>
          {state.order.trackingCode ? (
            <p className="mb-2 text-xs text-text-muted">
              Rastreio: <span className="font-mono text-cyan">{state.order.trackingCode}</span>
            </p>
          ) : null}
          <div className="mb-3 flex flex-col gap-1 border-t border-line pt-3">
            {state.order.items.map((item, i) => (
              <p key={i} className="text-xs text-text-muted">
                {item.quantity}x {item.name} ({item.size}/{item.color})
              </p>
            ))}
          </div>
          <p className="border-t border-line pt-3 text-right font-bold tabular-nums">
            {formatPrice(state.order.total)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderForm />
    </Suspense>
  );
}
