import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-4 text-3xl font-extrabold">Merci {order.customer.firstName} !</h1>
      <p className="mt-2 text-neutral-600">
        Votre commande <span className="font-bold text-brand-700">{order.number}</span> est
        confirmée. Un email récapitulatif vous sera envoyé.
      </p>
      <div className="mt-8 rounded-2xl bg-brand-50 p-6 text-left">
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
          <div className="flex justify-between border-t border-brand-100 pt-3 font-extrabold">
            <span>Total payé</span>
            <span className="text-brand-700">
              {formatUSD(order.totalUSD)} / {formatEUR(order.totalEUR)}
            </span>
          </div>
        </div>
      </div>
      <Link
        href="/catalogue"
        className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-3 font-bold text-white hover:bg-brand-700"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}
