import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Price from "@/components/Price";
import AddToCart from "@/components/AddToCart";

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

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waText = encodeURIComponent(
    `Bonjour Brenda Baddie Hair, je suis intéressée par : ${product.name}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]?.url ?? "/images/placeholder.png"}
              alt={product.images[0]?.alt ?? product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt ?? product.name}
                  className="aspect-square rounded-xl bg-brand-50 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>
          <div className="mt-3">
            <Price
              usd={product.priceUSD}
              eur={product.priceEUR}
              compareUSD={product.comparePriceUSD}
              compareEUR={product.comparePriceEUR}
              size="lg"
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

          <div className="mt-6">
            <AddToCart
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0]?.url,
                priceUSD: product.priceUSD,
                priceEUR: product.priceEUR,
              }}
              disabled={product.stock <= 0}
            />
          </div>

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
