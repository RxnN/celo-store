"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { confirmPayment } from "@/app/(store)/checkout/pagamento/actions";

export function PaymentConfirmButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await confirmPayment(orderId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push(`/checkout/sucesso?order=${orderId}`);
  }

  return (
    <div>
      <Button onClick={handleConfirm} disabled={loading} className="w-full">
        {loading ? "processando..." : "confirmar pagamento"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red">{error}</p> : null}
    </div>
  );
}
