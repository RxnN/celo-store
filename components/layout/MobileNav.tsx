"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";

type BrandLite = { id: string; name: string; slug: string };
type SubcategoryLite = { id: string; name: string; slug: string };
type CategoryWithSubcategories = {
  id: string;
  name: string;
  slug: string;
  subcategories: SubcategoryLite[];
};

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function MobileNav({
  categories,
  brands,
  userFirstName,
}: {
  categories: CategoryWithSubcategories[];
  brands: BrandLite[];
  userFirstName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const mounted = useMounted();

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
              <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col overflow-y-auto border-r border-line bg-bg">
                <div className="flex items-center justify-between px-5 pb-3 pt-5">
                  <Image
                    src="/images/celo-logo.jpg"
                    alt="Celo Store"
                    width={80}
                    height={80}
                    className="h-9 w-9 rounded-full border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Fechar menu"
                    className="text-text-muted hover:text-cyan"
                  >
                    ✕
                  </button>
                </div>

                <Link
                  href={userFirstName ? "/conta/pedidos" : "/conta/login"}
                  onClick={close}
                  className="neon-interactive mx-5 mb-3 flex items-center justify-between rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-cyan"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                    {userFirstName ? `Olá, ${userFirstName}` : "Entrar / Cadastre-se"}
                  </span>
                  <ChevronRight />
                </Link>

                {!userFirstName ? (
                  <Link
                    href="/rastrear"
                    onClick={close}
                    className="mx-5 mb-4 text-xs font-semibold text-text-faint hover:text-cyan"
                  >
                    Acompanhar meu pedido
                  </Link>
                ) : null}

                <div className="flex flex-col px-5">
                  <Link
                    href="/"
                    onClick={close}
                    className="neon-interactive rounded-md py-2.5 text-sm font-bold hover:text-cyan"
                  >
                    início
                  </Link>

                  {categories.map((c) => {
                    const isExpanded = expanded.has(c.id);
                    return (
                      <div key={c.id} className="border-t border-line">
                        <div className="flex items-center">
                          <Link
                            href={`/categoria/${c.slug}`}
                            onClick={close}
                            className="flex-1 py-2.5 text-sm font-bold hover:text-cyan"
                          >
                            {c.name}
                          </Link>
                          {c.subcategories.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(c.id)}
                              aria-label={`Ver subcategorias de ${c.name}`}
                              aria-expanded={isExpanded}
                              className="p-2.5 text-text-muted hover:text-cyan"
                            >
                              <span
                                className={`block transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                              >
                                <ChevronRight />
                              </span>
                            </button>
                          ) : null}
                        </div>
                        {isExpanded ? (
                          <div className="flex flex-col gap-0.5 pb-2 pl-4">
                            {c.subcategories.map((s) => (
                              <Link
                                key={s.id}
                                href={`/categoria/${c.slug}?subcategoria=${s.slug}`}
                                onClick={close}
                                className="rounded-md py-2 text-sm text-text-muted hover:text-cyan"
                              >
                                {s.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}

                  <div className="border-t border-line pt-2">
                    <p className="mb-1 mt-2 text-xs font-bold uppercase tracking-wide text-text-faint">
                      marcas
                    </p>
                    <div className="flex flex-col pb-6">
                      {brands.map((b) => (
                        <Link
                          key={b.id}
                          href={`/marca/${b.slug}`}
                          onClick={close}
                          className="rounded-md py-2 text-sm font-bold hover:text-cyan"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
