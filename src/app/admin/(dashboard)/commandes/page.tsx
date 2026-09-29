import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import { getOrderStatuses, PROTECTED_STATUS_KEY } from "@/lib/orderStatuses";
import OrdersFilters from "@/components/OrdersFilters";
import OrdersKanban, { type KanbanOrder } from "@/components/OrdersKanban";

export const dynamic = "force-dynamic";

interface SearchParams {
  [key: string]: string | undefined;
  q?: string;
  status?: string;
  payment?: string;
  from?: string;
  to?: string;
  view?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

function viewLink(params: SearchParams, view: string | undefined) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "view") sp.set(k, v);
  }
  if (view) sp.set("view", view);
  const qs = sp.toString();
  return `/admin/commandes${qs ? `?${qs}` : ""}`;
}

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.status) where.status = params.status;
  if (params.payment) where.paymentStatus = params.payment;
  if (params.from || params.to) {
    where.createdAt = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(`${params.to}T23:59:59`) } : {}),
    };
  }
  if (params.q) {
    const q = params.q;
    where.OR = [
      { number: { contains: q } },
      { customer: { firstName: { contains: q } } },
      { customer: { lastName: { contains: q } } },
      { customer: { email: { contains: q } } },
    ];
  }

  const isKanban = params.view === "kanban";

  const [orders, statuses] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    getOrderStatuses(),
  ]);

  const statusLabel = (key: string) =>
    statuses.find((s) => s.key === key)?.label ?? STATUS_LABELS[key] ?? key;

  const kanbanOrders: KanbanOrder[] = orders.map((o) => ({
    id: o.id,
    number: o.number,
    customerName: `${o.customer.firstName} ${o.customer.lastName}`,
    totalUSD: o.totalUSD,
    totalEUR: o.totalEUR,
    createdAt: o.createdAt.toISOString(),
    paymentStatus: o.paymentStatus,
    status: o.status,
  }));

  const toggleCls = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-bold ${
      active ? "bg-brand-600 text-white" : "text-neutral-600 hover:bg-neutral-100"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Commandes ({orders.length})</h1>
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          <Link href={viewLink(params, undefined)} className={toggleCls(!isKanban)}>
            Liste
          </Link>
          <Link href={viewLink(params, "kanban")} className={toggleCls(isKanban)}>
            Kanban
          </Link>
        </div>
      </div>
      <OrdersFilters
        current={params}
        statusOptions={statuses.map((s) => ({ value: s.key, label: s.label }))}
      />
      {isKanban ? (
        <div className="mt-6">
          <OrdersKanban
            initialOrders={kanbanOrders}
            initialStatuses={statuses}
            protectedKey={PROTECTED_STATUS_KEY}
          />
        </div>
      ) : (
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
                  <td className="p-4">{PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus}</td>
                  <td className="p-4">{statusLabel(o.status)}</td>
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
      )}
    </div>
  );
}
