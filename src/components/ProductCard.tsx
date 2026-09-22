import Link from "next/link";
import Price from "./Price";

export interface CardProduct {
  id: string;
  name: string;
  slug: string;
  priceUSD: number;
  priceEUR: number;
  comparePriceUSD?: number | null;
  comparePriceEUR?: number | null;
  images: { url: string; alt?: string | null }[];
  color?: string | null;
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const image = product.images[0]?.url ?? "/images/placeholder.png";
  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.images[0]?.alt ?? product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold leading-snug group-hover:text-brand-700">{product.name}</h3>
        {product.color && <p className="text-sm text-neutral-500">{product.color}</p>}
        <div className="mt-2">
          <Price
            usd={product.priceUSD}
            eur={product.priceEUR}
            compareUSD={product.comparePriceUSD}
            compareEUR={product.comparePriceEUR}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}
