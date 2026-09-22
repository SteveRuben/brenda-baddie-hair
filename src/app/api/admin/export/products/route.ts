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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  const header = [
    "Nom",
    "Slug",
    "Marque",
    "Couleur",
    "Taille",
    "Prix USD",
    "Prix EUR",
    "Stock",
    "Statut",
    "Vedette",
    "Variantes",
  ];

  const rows = products.map((p) =>
    [
      p.name,
      p.slug,
      p.brand ?? "",
      p.color ?? "",
      p.size ?? "",
      p.priceUSD,
      p.priceEUR,
      p.stock,
      p.status,
      p.featured ? "oui" : "non",
      p.variants.map((v) => `${v.name} (stock: ${v.stock})`).join(" | "),
    ]
      .map(csvCell)
      .join(";")
  );

  const csv = "\uFEFF" + [header.map(csvCell).join(";"), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produits-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
