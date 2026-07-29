"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, calculateShipping } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { useMounted } from "@/lib/use-mounted";

const emptyAddress = {
  label: "",
  recipient: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

type AddressValues = typeof emptyAddress;
type ShippingQuote = { value: number; free: boolean };
type AppliedCoupon = { code: string; discount: number };

export function CheckoutForm({
  defaultAddress,
  isGuest = false,
}: {
  defaultAddress?: AddressValues | null;
  isGuest?: boolean;
}) {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();
  const mounted = useMounted();
  const [address, setAddress] = useState(defaultAddress ?? emptyAddress);
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  const itemsKey = items.map((i) => `${i.productId}:${i.quantity}`).join(",");

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    fetchShippingQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, itemsKey]);

  useEffect(() => {
    if (!appliedCoupon) return;
    applyCoupon(appliedCoupon.code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  async function fetchShippingQuote(zip?: string) {
    setShippingLoading(true);
    try {
      const res = await fetch("/api/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          subtotal: totalPrice(),
          destinationZip: zip,
        }),
      });
      const data = await res.json();
      if (res.ok) setShippingQuote({ value: data.value, free: data.free });
    } catch {
      // keep whatever quote we already have; the form still falls back to an estimate
    } finally {
      setShippingLoading(false);
    }
  }

  async function applyCoupon(codeArg?: string, silent = false) {
    const code = codeArg ?? couponCode;
    if (!code.trim()) return;

    if (!silent) {
      setCouponLoading(true);
      setCouponError(null);
    }
    try {
      const res = await fetch("/api/cupom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
          subtotal: totalPrice(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAppliedCoupon(null);
        if (!silent) setCouponError(data.error ?? "Cupom inválido.");
        return;
      }
      setAppliedCoupon({ code: data.code, discount: data.discount });
      setCouponError(null);
    } catch {
      if (!silent) setCouponError("Erro de conexão ao validar o cupom.");
    } finally {
      if (!silent) setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Seu carrinho está vazio. Volte pra loja e adicione produtos antes de finalizar a compra.
      </p>
    );
  }

  const subtotal = totalPrice();
  const shipping = shippingQuote?.value ?? calculateShipping(subtotal);
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  function updateField(field: keyof typeof emptyAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function lookupCep(digits: string) {
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      numberInputRef.current?.focus();
    } catch {
      setCepError("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  function handleCepChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    updateField("zip", formatted);
    setCepError(null);

    if (digits.length === 8) {
      lookupCep(digits);
      fetchShippingQuote(digits);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          couponCode: appliedCoupon?.code,
          guestEmail: isGuest ? guestEmail : undefined,
          cfTurnstileToken: turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível finalizar o pedido.");
        setLoading(false);
        return;
      }

      clear();
      router.push(data.redirectUrl);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-faint">
          Endereço de entrega
        </h2>

        {defaultAddress ? (
          <p className="-mt-2 text-xs text-text-faint">
            Preenchido com seu endereço padrão. Pode editar os campos abaixo se quiser.
          </p>
        ) : null}

        {isGuest ? (
          <input
            required
            type="email"
            placeholder="Seu e-mail (pra confirmar e consultar o pedido depois)"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        ) : null}

        <input
          required
          placeholder="Nome do destinatário"
          value={address.recipient}
          onChange={(e) => updateField("recipient", e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />

        <div>
          <div className="relative">
            <input
              required
              inputMode="numeric"
              placeholder="CEP"
              value={address.zip}
              onChange={(e) => handleCepChange(e.target.value)}
              className="h-10 w-full max-w-[180px] rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            {cepLoading ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-faint">
                buscando…
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-text-faint">
            Digite o CEP primeiro pra gente completar rua, bairro, cidade e UF automaticamente — e
            calcular o frete.
          </p>
          {cepError ? <p className="mt-1 text-xs text-red">{cepError}</p> : null}
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <input
            required
            placeholder="Rua"
            value={address.street}
            onChange={(e) => updateField("street", e.target.value)}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
          <input
            ref={numberInputRef}
            required
            placeholder="Número"
            value={address.number}
            onChange={(e) => updateField("number", e.target.value)}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>

        <input
          placeholder="Complemento (opcional)"
          value={address.complement}
          onChange={(e) => updateField("complement", e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />

        <input
          required
          placeholder="Bairro"
          value={address.neighborhood}
          onChange={(e) => updateField("neighborhood", e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <input
            required
            placeholder="Cidade"
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
          <input
            required
            placeholder="UF"
            maxLength={2}
            value={address.state}
            onChange={(e) => updateField("state", e.target.value.toUpperCase())}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>

        <input
          required
          placeholder="Telefone"
          value={address.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />

        <Turnstile onToken={setTurnstileToken} />

        {error ? <p className="text-sm text-red">{error}</p> : null}

        <Button
          type="submit"
          disabled={loading || (turnstileEnabled && !turnstileToken)}
          className="mt-2"
        >
          {loading ? "processando..." : "ir para pagamento"}
        </Button>
      </form>

      <div className="h-fit rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-faint">
          Resumo do pedido
        </h2>
        <div className="mb-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span className="text-text-muted">
                {item.quantity}x {item.name} ({item.size}/{item.color})
              </span>
              <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mb-4 border-t border-line pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-faint">Cupom</p>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 text-sm">
              <span className="font-bold text-cyan">{appliedCoupon.code}</span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs text-text-faint hover:text-red"
              >
                remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="código do cupom"
                className="h-9 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-sm uppercase focus:border-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={() => applyCoupon()}
                disabled={couponLoading}
                className="neon-interactive rounded-lg border border-line px-3 text-xs font-semibold text-text-muted hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
              >
                {couponLoading ? "aplicando..." : "aplicar"}
              </button>
            </div>
          )}
          {couponError ? <p className="mt-2 text-xs text-red">{couponError}</p> : null}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-green">
              <span>Cupom ({appliedCoupon?.code})</span>
              <span className="tabular-nums">-{formatPrice(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-text-muted">
            <span>Frete</span>
            <span className="tabular-nums">
              {shippingLoading ? "calculando…" : shipping === 0 ? "Grátis" : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 text-base font-extrabold">
            <span>Total</span>
            <span className="tabular-nums text-cyan">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
