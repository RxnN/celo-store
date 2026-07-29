"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { requestPasswordReset, ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Esqueceu sua senha?</h1>
      <p className="mb-6 text-sm text-text-muted">
        Informe o e-mail ou telefone da sua conta pra gerar um link de redefinição.
      </p>

      {state.emailSent ? (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-text-muted">
            Enviamos um e-mail com o link de redefinição. Confira sua caixa de entrada (e o spam).
          </p>
        </div>
      ) : state.resetUrl ? (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-sm text-text-muted">
            Como o envio de e-mail ainda não está configurado neste ambiente, aqui está o link de
            redefinição direto:
          </p>
          <Link
            href={state.resetUrl}
            className="block break-all text-sm font-semibold text-cyan hover:underline"
          >
            {state.resetUrl}
          </Link>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-muted">
              E-mail ou telefone
            </label>
            <input
              name="identifier"
              required
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
            {pending ? "gerando link..." : "gerar link de redefinição"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-text-muted">
        Lembrou a senha?{" "}
        <Link href="/conta/login" className="font-semibold text-cyan hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
