"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

export function DeleteButton({
  action,
  label = "excluir",
  confirmText = "Tem certeza que quer excluir? Essa ação não pode ser desfeita.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-red hover:underline"
      >
        {label}
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-[var(--glow-cyan-sm)]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-5 text-sm text-text">{confirmText}</p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="neon-interactive rounded-lg border border-line px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-text disabled:opacity-50"
                  >
                    cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={pending}
                    className="rounded-lg bg-red px-3.5 py-1.5 text-xs font-bold text-red-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending ? "excluindo..." : "excluir"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
