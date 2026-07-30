"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createCoupon, CouponFormState } from "@/app/admin/cupons/actions";
import { useAdminToastStore } from "@/lib/admin-toast-store";

const initialState: CouponFormState = {};

export function CouponForm({ products }: { products: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createCoupon, initialState);
  const [type, setType] = useState("PERCENT");
  const [scope, setScope] = useState("ORDER_TOTAL");

  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const showToast = useAdminToastStore((s) => s.show);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      showToast("Cupom adicionado com sucesso!");
      formRef.current?.reset();
      setType("PERCENT");
      setScope("ORDER_TOTAL");
    }
    wasPending.current = pending;
  }, [pending, state, showToast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <input
        name="code"
        required
        placeholder='Código do cupom (ex: "VERAO10")'
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm uppercase focus:border-cyan focus:outline-none"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        >
          <option value="PERCENT">percentual (%)</option>
          <option value="FIXED">valor fixo (R$)</option>
        </select>

        <input
          name="value"
          type="number"
          step="0.01"
          min="0"
          max={type === "PERCENT" ? 100 : undefined}
          required
          placeholder={type === "PERCENT" ? "ex: 10" : "ex: 20.00"}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <select
        name="scope"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      >
        <option value="ORDER_TOTAL">valor total do pedido</option>
        <option value="SPECIFIC_PRODUCT">produto específico</option>
      </select>

      {scope === "SPECIFIC_PRODUCT" ? (
        <select
          name="productId"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        >
          <option value="">selecione o produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ) : null}

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "salvando..." : "adicionar cupom"}
      </Button>
    </form>
  );
}
