"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { HomeLink } from "./HomeLink";

type BrandLite = { id: string; name: string; slug: string };
type SubcategoryLite = { id: string; name: string; slug: string };
type CategoryWithSubcategories = {
  id: string;
  name: string;
  slug: string;
  subcategories: SubcategoryLite[];
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function NavMenu({
  categories,
  brands,
}: {
  categories: CategoryWithSubcategories[];
  brands: BrandLite[];
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<{ left: number; top: number } | null>(null);
  const mounted = useMounted();
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpenKey(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenKey(null);
    }
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Ref callbacks run after commit, never during render, so mutating the
  // shared map here is safe despite the lint rule's static heuristic.
  function registerRef(key: string) {
    return (el: HTMLDivElement | null) => {
      // eslint-disable-next-line react-hooks/refs
      if (el) itemRefs.current.set(key, el);
    };
  }

  // Always opens (never toggles closed): on desktop, hover has usually
  // already opened the panel by the time a click lands, so a naive toggle
  // would instantly close it again. Closing is handled by mouseleave,
  // outside click, Escape, or picking a link.
  function openMenu(key: string) {
    const el = itemRefs.current.get(key);
    if (el) {
      const rect = el.getBoundingClientRect();
      setAnchorRect({ left: rect.left, top: rect.bottom + 4 });
    }
    setOpenKey(key);
  }

  function closeIfOpen(key: string) {
    setOpenKey((k) => (k === key ? null : k));
  }

  const activeCategory = categories.find((c) => c.id === openKey);
  const showBrandsPanel = openKey === "marcas";

  return (
    <nav
      ref={navRef}
      className="scrollbar-none hidden items-center gap-8 overflow-x-auto border-t border-line px-4 py-3 text-[14px] font-bold text-text sm:flex sm:px-6"
    >
      <HomeLink className="neon-interactive whitespace-nowrap rounded-md hover:text-cyan">
        início
      </HomeLink>

      {categories.map((c) => (
        <div
          key={c.id}
          ref={registerRef(c.id)}
          className="relative"
          onMouseEnter={() => openMenu(c.id)}
          onMouseLeave={() => closeIfOpen(c.id)}
        >
          <div className="flex items-center gap-0.5 whitespace-nowrap rounded-md">
            <Link
              href={`/categoria/${c.slug}`}
              className="neon-interactive rounded-md hover:text-cyan"
            >
              {c.name}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openMenu(c.id);
              }}
              aria-label={`Abrir submenu de ${c.name}`}
              aria-expanded={openKey === c.id}
              className="neon-interactive rounded-md p-1 hover:text-cyan"
            >
              <Chevron open={openKey === c.id} />
            </button>
          </div>
        </div>
      ))}

      <div
        ref={registerRef("marcas")}
        className="relative"
        onMouseEnter={() => openMenu("marcas")}
        onMouseLeave={() => closeIfOpen("marcas")}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openMenu("marcas");
          }}
          aria-expanded={showBrandsPanel}
          className="neon-interactive flex items-center gap-1 whitespace-nowrap rounded-md hover:text-cyan"
        >
          marcas
          <Chevron open={showBrandsPanel} />
        </button>
      </div>

      {mounted && anchorRect && (activeCategory || showBrandsPanel)
        ? createPortal(
            <div
              ref={panelRef}
              style={{ position: "fixed", left: anchorRect.left, top: anchorRect.top }}
              onMouseEnter={() => setOpenKey(openKey)}
              onMouseLeave={() => setOpenKey(null)}
              className="z-50 min-w-[220px] rounded-b-lg rounded-tr-lg border border-line bg-surface p-4 shadow-[var(--glow-cyan-sm)]"
            >
              {activeCategory ? (
                <>
                  <Link
                    href={`/categoria/${activeCategory.slug}`}
                    onClick={() => setOpenKey(null)}
                    className="neon-interactive mb-1 block rounded-md px-2 py-1.5 text-sm font-bold text-text hover:text-cyan"
                  >
                    {activeCategory.name}
                  </Link>
                  {activeCategory.subcategories.length > 0 ? (
                    <div className="flex flex-col border-t border-line pt-1">
                      {activeCategory.subcategories.map((s) => (
                        <Link
                          key={s.id}
                          href={`/categoria/${activeCategory.slug}?subcategoria=${s.slug}`}
                          onClick={() => setOpenKey(null)}
                          className="neon-interactive block rounded-md px-2 py-2 text-sm text-text-muted hover:text-cyan"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/marca/${b.slug}`}
                    onClick={() => setOpenKey(null)}
                    className="neon-interactive block rounded-md px-2 py-2 text-sm text-text-muted hover:text-cyan"
                  >
                    {b.name}
                  </Link>
                ))
              )}
            </div>,
            document.body
          )
        : null}
    </nav>
  );
}
