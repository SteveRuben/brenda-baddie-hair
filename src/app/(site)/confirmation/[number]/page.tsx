import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/fulfillOrder";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { number } = await params;
  const { session_id } = await searchParams;
  let order = await prisma.order.findUnique({
    where: { number },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  // Retour Stripe : vérification synchrone de la session (le webhook reste
  // le filet de sécurité, idempotent). Évite d'afficher "confirmée" alors que
  // le webhook n'est pas encore passé.
  if (session_id && order.paymentStatus !== "paid" && stripeConfigured()) {
    try {
      const session = await stripeClient().checkout.sessions.retrieve(session_id);
      const paidCents = session.amount_total ?? 0;
      if (
        session.metadata?.orderId === order.id &&
        session.payment_status === "paid" &&
        Math.abs(paidCents - Math.round(order.totalUSD * 100)) <= 1
      ) {
        const r = await fulfillOrder(order.id);
        if (r.ok) {
          order = await prisma.order.findUnique({
            where: { number },
            include: { items: true, customer: true },
          });
        }
      }
    } catch (e) {
      console.error("[stripe] vérification session_id impossible :", e);
    }
  }
  if (!order) notFound();

  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          isPaid ? "bg-green-100" : "bg-amber-100"
        }`}
      >
        {isPaid ? "✓" : "…"}
      </div>
      <h1 className="mt-4 text-3xl font-extrabold">Merci {order.customer.firstName} !</h1>
      <p className="mt-2 text-neutral-600">
        {isPaid ? (
          <>
            Votre commande <span className="font-bold text-ink-950">{order.number}</span> est
            confirmée. Un email récapitulatif vous sera envoyé.
          </>
        ) : (
          <>
            Votre commande <span className="font-bold text-ink-950">{order.number}</span> est
            enregistrée, nous vérifions votre paiement. Vous recevrez un email de confirmation
            dès validation — si rien n'arrive, rechargez cette page dans quelques instants.
          </>
        )}
      </p>
      <div className="mt-8 rounded-2xl bg-ink-50 p-6 text-left">
        <h2 className="font-bold">Détail de la commande</h2>
        <div className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span className="font-semibold">{formatUSD(i.priceUSD * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-ink-200 pt-3 font-extrabold">
            <span>{isPaid ? "Total payé" : "Total"}</span>
            <span className="text-ink-950">
              {formatUSD(order.totalUSD)} / {formatEUR(order.totalEUR)}
            </span>
          </div>
        </div>
      </div>
      <Link
        href="/collection"
        className="mt-8 inline-block rounded-full bg-ink-950 px-8 py-3 font-bold text-white hover:bg-ink-800"
      >
        Continuer mes achats
      </Link>
      <p className="mt-4 text-sm text-neutral-500">
        Un souci avec votre commande ? Consultez notre{" "}
        <Link href="/retours" className="font-semibold text-ink-950 hover:underline">
          politique de retours
        </Link>
        .
      </p>
    </div>
  );
}
