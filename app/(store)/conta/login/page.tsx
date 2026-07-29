"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      identifier,
      password,
      turnstileToken,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail/telefone ou senha incorretos.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-7">
      <h1 className="mb-6 text-xl font-extrabold">Entrar</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted">
            E-mail ou telefone
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-text-muted">Senha</label>
            <Link href="/conta/esqueci-senha" className="text-xs text-cyan hover:underline">
              esqueceu sua senha?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        {error ? <p className="text-sm text-red">{error}</p> : null}

        <Button
          type="submit"
          disabled={loading || (turnstileEnabled && !turnstileToken)}
          className="mt-2"
        >
          {loading ? "entrando..." : "entrar"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        Não tem conta?{" "}
        <Link href="/conta/registro" className="font-semibold text-cyan hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
