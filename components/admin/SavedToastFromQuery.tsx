"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAdminToastStore } from "@/lib/admin-toast-store";

/**
 * Server actions que redirecionam (ex: criar/editar produto) não conseguem
 * repassar estado de sucesso direto pro client — usamos ?saved=1 na URL de
 * destino como sinal, mostramos o toast e limpamos o parâmetro da URL.
 */
export function SavedToastFromQuery({ message = "Salvo com sucesso!" }: { message?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useAdminToastStore((s) => s.show);

  useEffect(() => {
    if (searchParams.get("saved") !== "1") return;

    showToast(message);
    const params = new URLSearchParams(searchParams);
    params.delete("saved");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    // Só na montagem: não queremos reagir a mudanças subsequentes de searchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
