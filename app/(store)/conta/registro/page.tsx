"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { registerUser, RegisterState } from "./actions";

const initialState: RegisterState = {};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(registerUser, initialState);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl");
  const prefillName = searchParams.get("name") ?? "";
  const prefillEmail = searchParams.get("email") ?? "";
  const prefillPhone = searchParams.get("phone") ?? "";

  useEffect(() => {
    if (state.success) {
      const loginUrl = callbackUrl
        ? `/conta/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/conta/login";
      router.push(loginUrl);
    }
  }, [state.success, router, callbackUrl]);

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-7">
      <h1 className="mb-6 text-xl font-extrabold">Criar conta</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nome</label>
          <input
            name="name"
            required
            defaultValue={prefillName}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">E-mail</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={prefillEmail}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Telefone</label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={prefillPhone}
            placeholder="(11) 91234-5678"
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">Senha</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
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
          {pending ? "criando conta..." : "criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        Já tem conta?{" "}
        <Link href="/conta/login" className="font-semibold text-cyan hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
