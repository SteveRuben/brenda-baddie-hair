import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CatalogueFilters from "@/components/CatalogueFilters";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  color?: string;
  brand?: string;
  maxUSD?: string;
  sort?: string;
}

export default async function Catalogue({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: "active" };
  if (params.q) where.name = { contains: params.q, mode: "insensitive" };
  if (params.color) where.color = params.color;
  if (params.brand) where.brand = params.brand;
  if (params.maxUSD) where.priceUSD = { lte: Number(params.maxUSD) };

  const orderBy =
    params.sort === "price-asc"
      ? { priceUSD: "asc" as const }
      : params.sort === "price-desc"
        ? { priceUSD: "desc" as const }
        : { createdAt: "desc" as const };

  const [products, colors, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      select: { color: true },
      distinct: ["color"],
    }),
    prisma.product.findMany({
      where: { status: "active" },
      select: { brand: true },
      distinct: ["brand"],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Catalogue</h1>
      <p className="mt-1 text-neutral-500">{products.length} produit(s)</p>

      <CatalogueFilters
        colors={colors.map((c) => c.color).filter(Boolean) as string[]}
        brands={brands.map((b) => b.brand).filter(Boolean) as string[]}
        current={params}
      />

      {products.length === 0 ? (
        <p className="mt-10 text-neutral-500">Aucun produit ne correspond à vos critères.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
