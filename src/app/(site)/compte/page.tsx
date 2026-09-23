import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/orderLabels";
import CustomerProfileForm from "@/components/CustomerProfileForm";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const customerId = (session?.user as { id?: string } | undefined)?.id;

  if (role !== "customer" || !customerId) {
    redirect("/compte/connexion");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) redirect("/compte/connexion");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Mon compte</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Bonjour {customer.firstName}, voici votre espace personnel.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <CustomerProfileForm
          initial={{
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            postalCode: customer.postalCode,
            country: customer.country,
          }}
        />

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">Mes commandes</h2>
          {customer.orders.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">
              Vous n'avez pas encore passé de commande.{" "}
              <Link href="/catalogue" className="font-semibold text-brand-600 hover:underline">
                Découvrir la collection
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {customer.orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-neutral-100 p-4 transition hover:border-brand-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/compte/commandes/${o.id}`}
                      className="font-bold text-brand-700 hover:underline"
                    >
                      {o.number}
                    </Link>
                    <span className="text-xs text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-neutral-600">
                      {STATUS_LABELS[o.status] ?? o.status} · Paiement :{" "}
                      {PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus}
                    </span>
                    <span className="font-semibold">
                      {formatUSD(o.totalUSD)} / {formatEUR(o.totalEUR)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
