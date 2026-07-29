import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressForm } from "@/components/account/AddressForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { setDefaultAddress, deleteAddress } from "./actions";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await db.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }],
  });

  return (
    <div>
      <AddressForm />

      {addresses.length === 0 ? (
        <p className="text-sm text-text-muted">Você ainda não salvou nenhum endereço.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <div className="text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">{address.recipient}</span>
                  {address.isDefault ? (
                    <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan">
                      padrão
                    </span>
                  ) : null}
                </div>
                <p className="text-text-muted">
                  {address.street}, {address.number}
                  {address.complement ? ` – ${address.complement}` : ""}
                </p>
                <p className="text-text-muted">
                  {address.neighborhood} · {address.city}/{address.state} · {address.zip}
                </p>
                <p className="text-text-muted">{address.phone}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {!address.isDefault ? (
                  <form action={setDefaultAddress.bind(null, address.id)}>
                    <button type="submit" className="text-xs font-semibold text-cyan hover:underline">
                      tornar padrão
                    </button>
                  </form>
                ) : null}
                <DeleteButton action={deleteAddress.bind(null, address.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
