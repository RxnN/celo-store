"use client";

import { useActionState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { resetPassword, ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/conta/login");
    }
  }, [state.success, router]);

  if (!token) {
    return (
      <p className="text-sm text-red">
        Link inválido. Solicite um novo em{" "}
        <Link href="/conta/esqueci-senha" className="font-semibold text-cyan hover:underline">
          esqueci minha senha
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-muted">Nova senha</label>
        <input
          name="password"
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

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "salvando..." : "redefinir senha"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-7">
      <h1 className="mb-6 text-xl font-extrabold">Redefinir senha</h1>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
