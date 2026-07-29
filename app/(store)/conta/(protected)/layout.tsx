import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

const TABS = [
  { href: "/conta/pedidos", label: "Meus pedidos" },
  { href: "/conta/enderecos", label: "Meus endereços" },
  { href: "/conta/senha", label: "Trocar senha" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/conta/login?callbackUrl=/conta/pedidos");

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-7">
      <h1 className="mb-1 text-xl font-extrabold">Minha conta</h1>
      <p className="mb-6 text-sm text-text-muted">{session.user.email}</p>

      <nav className="mb-8 flex gap-2 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="neon-interactive rounded-t-lg px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-cyan"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
