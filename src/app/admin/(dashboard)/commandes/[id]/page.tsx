import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import OrderStatusForm from "@/components/OrderStatusForm";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">Commande {order.number}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Passée le {new Date(order.createdAt).toLocaleString("fr-FR")}
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Client</h2>
        <p className="mt-2 text-sm">
          {order.customer.firstName} {order.customer.lastName}
          <br />
          {order.customer.email}
          {order.customer.phone && (
            <>
              <br />
              {order.customer.phone}
            </>
          )}
          <br />
          {order.customer.address}
          {order.customer.postalCode && `, ${order.customer.postalCode}`}
          {order.customer.city && `, ${order.customer.city}`} {order.customer.country}
        </p>
        {order.notes && (
          <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm">
            <span className="font-semibold">Instructions :</span> {order.notes}
          </p>
        )}
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
          <div className="flex justify-between text-sm">
            <span>Livraison</span>
            <span className="font-semibold">
              {formatUSD(order.shippingUSD)} / {formatEUR(order.shippingEUR)}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3 font-extrabold">
            <span>Total</span>
            <span className="text-brand-700">
              {formatUSD(order.totalUSD)} / {formatEUR(order.totalEUR)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Suivi & statut</h2>
        <OrderStatusForm
          orderId={order.id}
          status={order.status}
          carrier={order.carrier ?? ""}
          trackingNumber={order.trackingNumber ?? ""}
        />
      </div>
    </div>
  );
}
