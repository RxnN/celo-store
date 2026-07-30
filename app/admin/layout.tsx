import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

const NAV_ITEMS = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/subcategorias", label: "Subcategorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/banners", label: "Promoções" },
  { href: "/admin/frete-gratis", label: "Frete grátis" },
  { href: "/admin/cupons", label: "Cupons" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/conta/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text sm:flex-row">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:hidden">
        <Link href="/" className="text-sm font-extrabold tracking-widest">
          CELO STORE
        </Link>
        <AdminMobileNav navItems={NAV_ITEMS} userEmail={session.user.email ?? ""} />
      </header>

      <aside className="hidden w-[210px] shrink-0 border-r border-line px-5 py-6 sm:block">
        <Link href="/" className="mb-8 block text-sm font-extrabold tracking-widest">
          CELO STORE
        </Link>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-text-faint">
          administração
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface hover:text-cyan"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 border-t border-line pt-4 text-sm text-text-muted">
          <p className="mb-2 truncate">{session.user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-8 sm:py-7">{children}</main>
    </div>
  );
}
