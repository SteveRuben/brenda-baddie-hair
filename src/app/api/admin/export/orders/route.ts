import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });

  const header = [
    "Numero",
    "Date",
    "Client",
    "Email",
    "Telephone",
    "Adresse",
    "Ville",
    "Code postal",
    "Pays",
    "Articles",
    "Sous-total USD",
    "Sous-total EUR",
    "Livraison USD",
    "Livraison EUR",
    "Total USD",
    "Total EUR",
    "Statut",
    "Paiement",
    "Transporteur",
    "Suivi",
  ];

  const rows = orders.map((o) =>
    [
      o.number,
      o.createdAt.toISOString(),
      `${o.customer.firstName} ${o.customer.lastName}`,
      o.customer.email,
      o.customer.phone ?? "",
      o.customer.address ?? "",
      o.customer.city ?? "",
      o.customer.postalCode ?? "",
      o.customer.country ?? "",
      o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
      o.subtotalUSD,
      o.subtotalEUR,
      o.shippingUSD,
      o.shippingEUR,
      o.totalUSD,
      o.totalEUR,
      o.status,
      o.paymentStatus,
      o.carrier ?? "",
      o.trackingNumber ?? "",
    ]
      .map(csvCell)
      .join(";")
  );

  const csv = "\uFEFF" + [header.map(csvCell).join(";"), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
