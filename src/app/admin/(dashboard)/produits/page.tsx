import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatUSD, formatEUR } from "@/lib/format";
import SeedDemoImagesButton from "./SeedDemoImagesButton";
import SeedDemoVariantsButton from "./SeedDemoVariantsButton";
import WipeDatabaseButton from "./WipeDatabaseButton";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produits ({products.length})</h1>
        <div className="flex items-center gap-3">
          <SeedDemoVariantsButton />
          <SeedDemoImagesButton />
          <WipeDatabaseButton />
          <Link
            href="/admin/produits/nouveau"
            className="rounded-full bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-700"
          >
            + Nouveau produit
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-500">
              <th className="p-4">Produit</th>
              <th className="p-4">Prix USD</th>
              <th className="p-4">Prix EUR</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Statut</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-50 hover:bg-brand-50/50">
                <td className="p-4 font-semibold">{p.name}</td>
                <td className="p-4">{formatUSD(p.priceUSD)}</td>
                <td className="p-4">{formatEUR(p.priceEUR)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/produits/${p.id}`} className="font-semibold text-brand-600 hover:underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
