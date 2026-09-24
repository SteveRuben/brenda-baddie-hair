import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import ProductPurchase from "@/components/ProductPurchase";
import ProductGallery from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

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
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>

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
                  priceUSD: v.priceUSD,
                  priceEUR: v.priceEUR,
                  stock: v.stock,
                })),
              }}
            />
          </div>

          <div className="mt-4 space-y-1 text-sm text-neutral-600">
            {product.brand && (
              <p>
                <span className="font-semibold">Marque :</span> {product.brand}
              </p>
            )}
            {product.color && (
              <p>
                <span className="font-semibold">Couleur :</span> {product.color}
              </p>
            )}
            {product.size && (
              <p>
                <span className="font-semibold">Taille :</span> {product.size}
              </p>
            )}
            <p>
              <span className="font-semibold">Stock :</span>{" "}
              {product.stock > 0 ? `${product.stock} disponible(s)` : "Rupture de stock"}
            </p>
          </div>

          <p className="mt-5 leading-relaxed text-neutral-700">{product.description}</p>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-full border-2 border-brand-600 px-6 py-2.5 font-bold text-brand-700 transition hover:bg-brand-50"
            >
              Commander via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
