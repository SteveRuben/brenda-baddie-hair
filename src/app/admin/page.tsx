import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, productCount, lowStock] = await Promise.all([
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
  ]);

  const paid = await prisma.order.aggregate({
    where: { paymentStatus: "paid" },
    _sum: { totalUSD: true, totalEUR: true },
    _count: true,
  });

  const cards = [
    { label: "Chiffre d'affaires (payé)", value: `${formatUSD(paid._sum.totalUSD ?? 0)} / ${formatEUR(paid._sum.totalEUR ?? 0)}` },
    { label: "Commandes payées", value: String(paid._count) },
    { label: "Produits actifs", value: String(productCount) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
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
                  {o.customer.firstName} {o.customer.lastName} — {o.status} / {o.paymentStatus}
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
    </div>
  );
}
