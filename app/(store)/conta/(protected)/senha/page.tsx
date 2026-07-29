"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { changePassword, ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="max-w-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-faint">
        Trocar senha
      </h2>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            Senha atual
          </label>
          <input
            name="currentPassword"
            type="password"
            required
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nova senha</label>
          <input
            name="newPassword"
            type="password"
            required
            minLength={6}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            Confirmar nova senha
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>

        {state.error ? <p className="text-sm text-red">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green">Senha alterada com sucesso.</p> : null}

        <Button type="submit" disabled={pending} className="mt-2 w-fit">
          {pending ? "salvando..." : "salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
