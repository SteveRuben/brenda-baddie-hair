import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });
  if (!product) notFound();

  return (
    <ProductForm
      initial={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand ?? "",
        color: product.color ?? "",
        size: product.size ?? "",
        priceUSD: String(product.priceUSD),
        priceEUR: String(product.priceEUR),
        comparePriceUSD: product.comparePriceUSD != null ? String(product.comparePriceUSD) : "",
        comparePriceEUR: product.comparePriceEUR != null ? String(product.comparePriceEUR) : "",
        stock: String(product.stock),
        status: product.status,
        featured: product.featured,
        images: product.images.map((i) => i.url),
        variants: product.variants.map((v) => ({
          name: v.name,
          type: v.type ?? "",
          priceUSD: v.priceUSD != null ? String(v.priceUSD) : "",
          priceEUR: v.priceEUR != null ? String(v.priceEUR) : "",
          stock: String(v.stock),
        })),
      }}
    />
  );
}
