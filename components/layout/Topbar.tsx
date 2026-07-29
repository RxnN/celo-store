import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CartButton } from "./CartButton";
import { SignOutButton } from "./SignOutButton";
import { NavMenu } from "./NavMenu";
import { MobileNav } from "./MobileNav";
import { HomeLink } from "./HomeLink";

export async function Topbar() {
  const [categories, brands, session] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { subcategories: { orderBy: { name: "asc" } } },
    }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    auth(),
  ]);

  const categoriesWithSubcategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    subcategories: c.subcategories.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
  }));

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:gap-5 sm:px-6">
        <HomeLink className="shrink-0 whitespace-nowrap">
          <Image
            src="/images/celo-logo.jpg"
            alt="Celo Store"
            width={96}
            height={96}
            priority
            className="h-11 w-11 rounded-full border border-line object-cover sm:h-12 sm:w-12"
          />
        </HomeLink>

        <form
          action="/busca"
          method="get"
          className="hidden max-w-3xl flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3.5 focus-within:border-cyan sm:flex"
        >
          <input
            name="q"
            placeholder="buscar produtos"
            className="h-9 w-full flex-1 bg-transparent text-[13px] text-text placeholder:text-text-faint focus:outline-none"
          />
          <span className="h-5 w-px bg-line" aria-hidden="true" />
          <button type="submit" aria-label="Buscar" className="text-text-muted hover:text-cyan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-[15px] text-text-muted">
          {!session?.user ? (
            <Link
              href="/rastrear"
              className="hidden items-center gap-1.5 sm:flex hover:text-text"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M16.5 9.4 7.5 4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
              acompanhar meu pedido
            </Link>
          ) : null}

          {session?.user ? (
            <div className="hidden items-center divide-x divide-line sm:flex">
              <Link href="/conta/pedidos" className="flex items-center gap-1.5 pr-4 hover:text-text">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
                {session.user.name?.split(" ")[0] ?? "minha conta"}
              </Link>
              {session.user.role === "ADMIN" ? (
                <Link href="/admin" className="px-4 font-semibold text-cyan hover:underline">
                  painel admin
                </Link>
              ) : null}
              <span className="pl-4">
                <SignOutButton />
              </span>
            </div>
          ) : (
            <Link
              href="/conta/login"
              className="hidden items-center gap-1.5 sm:flex hover:text-text"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              entrar / cadastrar
            </Link>
          )}

          <Link
            href="/busca"
            aria-label="Buscar"
            className="neon-interactive flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-muted hover:text-cyan sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>

          <CartButton />

          <MobileNav
            categories={categoriesWithSubcategories}
            brands={brands}
            userFirstName={session?.user?.name?.split(" ")[0]}
          />
        </div>
      </div>

      <NavMenu categories={categoriesWithSubcategories} brands={brands} />
    </header>
  );
}
