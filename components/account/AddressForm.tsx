"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { createAddress, AddressFormState } from "@/app/(store)/conta/(protected)/enderecos/actions";

const initialState: AddressFormState = {};

export function AddressForm() {
  const [state, formAction, pending] = useActionState(createAddress, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <p className="text-sm font-bold uppercase tracking-wide text-text-faint">Novo endereço</p>

      <input
        name="recipient"
        required
        placeholder="Nome do destinatário"
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <input
          name="street"
          required
          placeholder="Rua"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
        <input
          name="number"
          required
          placeholder="Número"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <input
        name="complement"
        placeholder="Complemento (opcional)"
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      <input
        name="neighborhood"
        required
        placeholder="Bairro"
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
        <input
          name="city"
          required
          placeholder="Cidade"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
        <input
          name="state"
          required
          maxLength={2}
          placeholder="UF"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
        <input
          name="zip"
          required
          placeholder="CEP"
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <input
        name="phone"
        required
        placeholder="Telefone"
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "salvando..." : "salvar endereço"}
      </Button>
    </form>
  );
}
