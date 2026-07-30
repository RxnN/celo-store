"use client";

import { useState } from "react";
import { useAdminToastStore } from "@/lib/admin-toast-store";

const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Processando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export function OrderStatusForm({
  orderId,
  status,
  trackingCode,
  action,
}: {
  orderId: string;
  status: string;
  trackingCode: string | null;
  action: (orderId: string, formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [selected, setSelected] = useState(status);
  const [code, setCode] = useState(trackingCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const showToast = useAdminToastStore((s) => s.show);

  const needsTrackingCode = selected === "SHIPPED";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (needsTrackingCode && !code.trim()) {
      setError("Informe o código de rastreio antes de marcar como enviado.");
      return;
    }
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("status", selected);
    formData.set("trackingCode", code.trim());
    const result = await action(orderId, formData);
    setPending(false);
    if (result?.error) setError(result.error);
    else showToast("Status do pedido salvo com sucesso!");
  }

  async function handleStatusChange(newStatus: string) {
    setSelected(newStatus);
    setError(null);
    if (newStatus !== "SHIPPED") {
      const formData = new FormData();
      formData.set("status", newStatus);
      formData.set("trackingCode", code.trim());
      const result = await action(orderId, formData);
      if (result?.error) setError(result.error);
      else showToast("Status do pedido salvo com sucesso!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1.5">
      <select
        value={selected}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="h-9 rounded-lg border border-line bg-surface-2 px-2 text-xs focus:border-cyan focus:outline-none"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      {needsTrackingCode ? (
        <div className="flex items-center gap-1.5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de rastreio"
            required
            className="h-8 w-36 rounded-lg border border-line bg-surface-2 px-2 text-xs focus:border-cyan focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="neon-interactive rounded-lg bg-cyan px-2.5 py-1.5 text-[11px] font-bold text-cyan-ink"
          >
            {pending ? "salvando..." : "salvar"}
          </button>
        </div>
      ) : null}

      {error ? <p className="max-w-[180px] text-right text-[11px] text-red">{error}</p> : null}
    </form>
  );
}
