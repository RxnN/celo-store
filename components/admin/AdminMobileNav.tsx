"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { SignOutButton } from "@/components/layout/SignOutButton";

type NavItem = { href: string; label: string };

export function AdminMobileNav({
  navItems,
  userEmail,
}: {
  navItems: NavItem[];
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="neon-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-text-muted hover:text-cyan sm:hidden"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-50 sm:hidden">
              <div className="absolute inset-0 bg-black/70" onClick={close} />
              <div className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col overflow-y-auto border-r border-line bg-bg px-5 py-6">
                <div className="mb-8 flex items-center justify-between">
                  <Link href="/" onClick={close} className="text-sm font-extrabold tracking-widest">
                    CELO STORE
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Fechar menu"
                    className="text-text-muted hover:text-cyan"
                  >
                    ✕
                  </button>
                </div>

                <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-text-faint">
                  administração
                </p>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface hover:text-cyan"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-10 border-t border-line pt-4 text-sm text-text-muted">
                  <p className="mb-2 truncate">{userEmail}</p>
                  <SignOutButton />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
