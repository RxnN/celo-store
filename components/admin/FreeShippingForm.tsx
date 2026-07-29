"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createFreeShippingRule,
  FreeShippingFormState,
} from "@/app/admin/frete-gratis/actions";

const initialState: FreeShippingFormState = {};

export function FreeShippingForm({ products }: { products: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createFreeShippingRule, initialState);
  const [type, setType] = useState("MIN_VALUE");

  return (
    <form
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <input
        name="label"
        required
        placeholder='Nome da regra (ex: "Frete grátis acima de R$300")'
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      >
        <option value="MIN_VALUE">valor mínimo do carrinho</option>
        <option value="MIN_QUANTITY">quantidade mínima de itens</option>
        <option value="SPECIFIC_PRODUCT">produto específico</option>
      </select>

      {type === "MIN_VALUE" ? (
        <input
          name="minValue"
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor mínimo (R$)"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      ) : null}

      {type === "MIN_QUANTITY" ? (
        <input
          name="minQuantity"
          type="number"
          min="1"
          placeholder="Quantidade mínima de itens"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      ) : null}

      {type === "SPECIFIC_PRODUCT" ? (
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
        {pending ? "salvando..." : "adicionar regra"}
      </Button>
    </form>
  );
}
