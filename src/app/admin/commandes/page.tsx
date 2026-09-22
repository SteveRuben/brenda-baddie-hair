import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Commandes ({orders.length})</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="p-4">N°</th>
              <th className="p-4">Client</th>
              <th className="p-4">Total</th>
              <th className="p-4">Paiement</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-50 hover:bg-brand-50/50">
                <td className="p-4 font-bold">{o.number}</td>
                <td className="p-4">
                  {o.customer.firstName} {o.customer.lastName}
                </td>
                <td className="p-4 font-semibold">
                  {formatUSD(o.totalUSD)} / {formatEUR(o.totalEUR)}
                </td>
                <td className="p-4">{o.paymentStatus}</td>
                <td className="p-4">{o.status}</td>
                <td className="p-4 text-neutral-500">
                  {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="p-4">
                  <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-neutral-500">Aucune commande pour le moment.</p>}
      </div>
    </div>
  );
}
