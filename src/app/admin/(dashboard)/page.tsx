import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";

export const dynamic = "force-dynamic";

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

export default async function AdminDashboard() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - ((startOfDay.getDay() + 6) % 7));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, productCount, lowStock, paid, dayCount, weekCount, monthCount, paymentGroups, topSales] =
    await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { customer: true },
      }),
      prisma.product.count({ where: { status: "active" } }),
      prisma.product.findMany({
        where: { status: "active", stock: { lte: 5 } },
        take: 8,
        orderBy: { stock: "asc" },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "paid" },
        _sum: { totalUSD: true, totalEUR: true },
        _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        _count: true,
        _sum: { totalUSD: true, totalEUR: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const topProducts = await prisma.product.findMany({
    where: { id: { in: topSales.map((t) => t.productId) } },
    select: { id: true, name: true },
  });
  const topById = new Map(topProducts.map((p) => [p.id, p.name]));
  const topList = topSales.map((t) => ({
    name: topById.get(t.productId) ?? "Produit supprimé",
    qty: t._sum.quantity ?? 0,
  }));

  const cards = [
    { label: "Chiffre d'affaires (payé)", value: `${formatUSD(paid._sum.totalUSD ?? 0)} / ${formatEUR(paid._sum.totalEUR ?? 0)}` },
    { label: "Commandes payées", value: String(paid._count) },
    { label: "Produits actifs", value: String(productCount) },
    { label: "Commandes aujourd'hui", value: String(dayCount) },
    { label: "Commandes cette semaine", value: String(weekCount) },
    { label: "Commandes ce mois", value: String(monthCount) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
        <div className="flex gap-2">
          <a
            href="/api/admin/export/orders"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
          >
            Export commandes (CSV)
          </a>
          <a
            href="/api/admin/export/products"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
          >
            Export produits (CSV)
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-xl font-extrabold text-brand-700">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-bold">Dernières commandes</h2>
          <div className="mt-3 space-y-2">
            {orders.length === 0 && <p className="text-sm text-neutral-500">Aucune commande.</p>}
            {orders.map((o) => (
              <a key={o.id} href={`/admin/commandes/${o.id}`} className="block rounded-xl bg-white p-4 shadow-sm hover:shadow">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{o.number}</span>
                  <span className="font-extrabold text-brand-700">{formatUSD(o.totalUSD)}</span>
                </div>
                <p className="text-xs text-neutral-500">
                  {o.customer.firstName} {o.customer.lastName} — {STATUS_LABELS[o.status] ?? o.status} / {PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus}
                </p>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold">Alertes stock faible</h2>
          <div className="mt-3 space-y-2">
            {lowStock.length === 0 && <p className="text-sm text-neutral-500">Aucune alerte.</p>}
            {lowStock.map((p) => (
              <a key={p.id} href={`/admin/produits/${p.id}`} className="block rounded-xl bg-white p-4 shadow-sm hover:shadow">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{p.name}</span>
                  <span className={`font-extrabold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock} restant(s)
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-bold">Produits les plus vendus</h2>
          <div className="mt-3 space-y-2">
            {topList.length === 0 && <p className="text-sm text-neutral-500">Aucune vente pour le moment.</p>}
            {topList.map((t) => (
              <div key={t.name} className="flex justify-between rounded-xl bg-white p-4 text-sm shadow-sm">
                <span className="font-bold">{t.name}</span>
                <span className="font-extrabold text-brand-700">{t.qty} vendu(s)</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold">Statut des paiements</h2>
          <div className="mt-3 space-y-2">
            {paymentGroups.length === 0 && <p className="text-sm text-neutral-500">Aucune commande.</p>}
            {paymentGroups.map((g) => (
              <div key={g.paymentStatus} className="flex justify-between rounded-xl bg-white p-4 text-sm shadow-sm">
                <span className="font-bold">{PAYMENT_LABELS[g.paymentStatus] ?? g.paymentStatus}</span>
                <span className="text-neutral-600">
                  {g._count} commande(s) — {formatUSD(g._sum.totalUSD ?? 0)} / {formatEUR(g._sum.totalEUR ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
