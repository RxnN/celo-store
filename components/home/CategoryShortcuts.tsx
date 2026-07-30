"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export type CategoryShortcut = { slug: string; name: string; image: string | null; href: string };

export function CategoryShortcuts({ categories }: { categories: CategoryShortcut[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  function scrollByAmount(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });
  }

  return (
    <div className="relative mb-8">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Anterior"
        className="neon-interactive absolute left-0 top-8 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-text-muted hover:text-cyan sm:hidden"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Próximo"
        className="neon-interactive absolute right-0 top-8 z-10 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-text-muted hover:text-cyan sm:hidden"
      >
        ›
      </button>

      <div
        ref={trackRef}
        className="scrollbar-none flex gap-5 overflow-x-auto scroll-smooth pb-1 sm:justify-between sm:overflow-visible"
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={c.href}
            className="group flex shrink-0 flex-col items-center gap-2"
          >
            <div className="neon-interactive flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 group-hover:border-cyan sm:h-20 sm:w-20">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-extrabold text-text-faint">{c.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-center text-[11px] font-bold uppercase tracking-wide text-text-muted group-hover:text-cyan">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
