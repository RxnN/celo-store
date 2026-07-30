"use client";

import { useEffect } from "react";
import { useAdminToastStore } from "@/lib/admin-toast-store";

export function AdminToast() {
  const { message, token, hide } = useAdminToastStore();

  useEffect(() => {
    if (!message) return;
    const hideTimer = setTimeout(() => hide(), 2600);
    return () => clearTimeout(hideTimer);
  }, [token, message, hide]);

  if (!message) return null;

  return (
    <div
      key={token}
      className="toast-in fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <div className="mx-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-green/40 bg-surface px-4 py-3 shadow-[var(--glow-cyan-sm)]">
        <span className="text-green">✓</span>
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}
