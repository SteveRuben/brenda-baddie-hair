import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/orderLabels";

export const dynamic = "force-dynamic";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const customerId = (session?.user as { id?: string } | undefined)?.id;

  if (role !== "customer" || !customerId) {
    redirect("/compte/connexion");
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order || order.customerId !== customerId) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/compte" className="text-sm font-semibold text-brand-600 hover:underline">
        Retour à mon compte
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold">Commande {order.number}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Passée le {new Date(order.createdAt).toLocaleString("fr-FR")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Statut</p>
          <p className="mt-1 font-bold text-brand-700">{STATUS_LABELS[order.status] ?? order.status}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Paiement</p>
          <p className="mt-1 font-bold">{PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Suivi</p>
          <p className="mt-1 font-bold">
            {order.carrier || order.trackingNumber
              ? `${order.carrier ?? ""} ${order.trackingNumber ?? ""}`.trim()
              : "Non disponible"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Articles</h2>
        <div className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span className="font-semibold">
                {formatUSD(i.priceUSD * i.quantity)} / {formatEUR(i.priceEUR * i.quantity)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-500">Sous-total</span>
            <span className="font-semibold">
              {formatUSD(order.subtotalUSD)} / {formatEUR(order.subtotalEUR)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Livraison</span>
            <span className="font-semibold">
              {formatUSD(order.shippingUSD)} / {formatEUR(order.shippingEUR)}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-extrabold">
            <span>Total</span>
            <span className="text-brand-700">
              {formatUSD(order.totalUSD)} / {formatEUR(order.totalEUR)}
            </span>
          </div>
        </div>
      </div>

      <a
        href={`/api/compte/factures/${order.id}`}
        className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
      >
        Télécharger la facture (PDF)
      </a>
    </div>
  );
}
