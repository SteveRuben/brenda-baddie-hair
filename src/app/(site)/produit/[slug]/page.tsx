import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import ProductPurchase from "@/components/ProductPurchase";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordions from "@/components/ProductAccordions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    if (!product || product.status !== "active") return {};
    const description =
      product.description?.slice(0, 160) ||
      `${product.name} — perruque premium bree baddie hair.`;
    const fallbackImage = {
      url: "/images/og-image.png?v=2",
      width: 1200,
      height: 630,
      alt: product.name,
    };
    const images = product.images[0]?.url ? [{ url: product.images[0].url }] : [fallbackImage];
    return {
      title: product.name,
      description,
      openGraph: { title: product.name, description, images, type: "website" },
      twitter: { card: "summary_large_image", title: product.name, description, images: images.map((i) => i.url) },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });

  if (!product || product.status !== "active") notFound();

  const whatsapp =
    (await getSetting("whatsappNumber")) || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waText = encodeURIComponent(
    `Bonjour bree baddie hair, je suis intéressée par : ${product.name}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl tracking-tight">{product.name}</h1>

          <div className="mt-3">
            <ProductPurchase
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0]?.url,
                priceUSD: product.priceUSD,
                priceEUR: product.priceEUR,
                comparePriceUSD: product.comparePriceUSD,
                comparePriceEUR: product.comparePriceEUR,
                stock: product.stock,
                variants: product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  type: v.type ?? null,
                  priceUSD: v.priceUSD,
                  priceEUR: v.priceEUR,
                  stock: v.stock,
                })),
              }}
            />
          </div>

          <ProductAccordions
            description={product.description}
            brand={product.brand}
            color={product.color}
            size={product.size}
            stock={product.stock}
          />

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-full border-2 border-ink-950 px-6 py-2.5 font-bold text-ink-950 transition hover:bg-ink-100"
            >
              Commander via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
