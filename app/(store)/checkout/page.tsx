import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { LinkButton } from "@/components/ui/Button";

function GuestOrLoginChoice() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center sm:px-7">
      <h1 className="mb-2 text-xl font-extrabold">Como você quer continuar?</h1>
      <p className="mb-8 text-sm text-text-muted">
        Entre na sua conta pra usar endereços salvos e acompanhar seus pedidos, ou finalize a
        compra sem se cadastrar.
      </p>
      <div className="flex flex-col gap-3">
        <LinkButton href="/conta/login?callbackUrl=/checkout">entrar na minha conta</LinkButton>
        <LinkButton href="/conta/registro?callbackUrl=/checkout" variant="ghost">
          criar conta
        </LinkButton>
        <LinkButton href="/checkout?guest=1" variant="surface">
          continuar sem login
        </LinkButton>
      </div>
    </div>
  );
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const session = await auth();
  const { guest } = await searchParams;

  if (!session?.user && guest !== "1") {
    return <GuestOrLoginChoice />;
  }

  const defaultAddress = session?.user
    ? await db.address.findFirst({ where: { userId: session.user.id, isDefault: true } })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-7">
      <h1 className="mb-6 text-xl font-extrabold">Finalizar compra</h1>
      <CheckoutForm
        isGuest={!session?.user}
        defaultAddress={
          defaultAddress
            ? {
                label: defaultAddress.label ?? "",
                recipient: defaultAddress.recipient,
                street: defaultAddress.street,
                number: defaultAddress.number,
                complement: defaultAddress.complement ?? "",
                neighborhood: defaultAddress.neighborhood,
                city: defaultAddress.city,
                state: defaultAddress.state,
                zip: defaultAddress.zip,
                phone: defaultAddress.phone,
              }
            : null
        }
      />
    </div>
  );
}
