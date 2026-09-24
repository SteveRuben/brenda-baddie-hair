import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CollectionFilters from "@/components/CollectionFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Collections",
  description:
    "Découvrez nos collections de perruques premium : body wave, straight, curly. Qualité, style et confiance.",
};

interface SearchParams {
  [key: string]: string | undefined;
  q?: string;
  color?: string;
  brand?: string;
  size?: string;
  minUSD?: string;
  maxUSD?: string;
  minEUR?: string;
  maxEUR?: string;
  sort?: string;
}

export default async function Collection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: "active" };
  if (params.q) where.name = { contains: params.q, mode: "insensitive" };
  if (params.categorie) where.category = { slug: params.categorie };
  if (params.color) where.color = params.color;
  if (params.brand) where.brand = params.brand;
  if (params.size) where.size = params.size;
  if (params.minUSD || params.maxUSD) {
    where.priceUSD = {
      ...(params.minUSD ? { gte: Number(params.minUSD) } : {}),
      ...(params.maxUSD ? { lte: Number(params.maxUSD) } : {}),
    };
  }
  if (params.minEUR || params.maxEUR) {
    where.priceEUR = {
      ...(params.minEUR ? { gte: Number(params.minEUR) } : {}),
      ...(params.maxEUR ? { lte: Number(params.maxEUR) } : {}),
    };
  }

  const [colors, brands, sizes] = await Promise.all([
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
    prisma.product.findMany({
      where: { status: "active" },
      select: { size: true },
      distinct: ["size"],
    }),
  ]);

  const include = {
    images: { orderBy: { position: "asc" as const }, take: 2 },
    variants: { select: { priceUSD: true, priceEUR: true } },
  };
  let products;
  let activeCategory: { name: string } | null = null;

  if (params.sort === "popular") {
    const sales = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
    });
    const rank = new Map(sales.map((s) => [s.productId, s._sum.quantity ?? 0]));
    const list = await prisma.product.findMany({ where, include });
    list.sort((a, b) => (rank.get(b.id) ?? 0) - (rank.get(a.id) ?? 0));
    products = list;
  } else {
    const orderBy =
      params.sort === "price-asc"
        ? { priceUSD: "asc" as const }
        : params.sort === "price-desc"
          ? { priceUSD: "desc" as const }
          : { createdAt: "desc" as const };
    products = await prisma.product.findMany({ where, orderBy, include });
  }
  if (params.categorie) {
    activeCategory = await prisma.category.findUnique({
      where: { slug: String(params.categorie) },
      select: { name: true },
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">
        {activeCategory ? activeCategory.name : "Collections"}
      </h1>
      <p className="mt-1 text-neutral-500">{products.length} produit(s)</p>

      <CollectionFilters
        colors={colors.map((c) => c.color).filter(Boolean) as string[]}
        brands={brands.map((b) => b.brand).filter(Boolean) as string[]}
        sizes={sizes.map((s) => s.size).filter(Boolean) as string[]}
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
