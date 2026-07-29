"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

type Quote = { value: number; free: boolean; source: string };

export function ShippingEstimate({
  items,
  subtotal,
}: {
  items: { productId: string; quantity: number }[];
  subtotal: number;
}) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCepChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    setQuote(null);
    setError(null);
  }

  async function handleCalculate() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP válido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal, destinationZip: digits }),
      });
      if (!res.ok) throw new Error();
      setQuote(await res.json());
    } catch {
      setError("Não foi possível calcular o frete agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-faint">
        Calcular frete
      </p>
      <div className="flex gap-2">
        <input
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          inputMode="numeric"
          placeholder="CEP"
          maxLength={9}
          className="h-9 w-32 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="neon-interactive rounded-lg border border-line px-3 text-xs font-semibold text-text-muted hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "calculando..." : "calcular"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red">{error}</p> : null}
      {quote ? (
        <p className="mt-2 text-sm">
          {quote.free ? (
            <span className="font-bold text-green">Frete grátis pra esse CEP</span>
          ) : (
            <>
              Frete estimado:{" "}
              <span className="font-bold text-cyan">{formatPrice(quote.value)}</span>
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
