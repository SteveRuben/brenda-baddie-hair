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
  variants?: { priceUSD?: number | null; priceEUR?: number | null }[];
}

// Carte produit inspirée des collections Nandi's Wigs : visuel plein,
// 2ᵉ image au survol, nom en capitales, prix « Dès » si variantes.
export default function ProductCard({ product }: { product: CardProduct }) {
  const [first, second] = product.images;
  const image = first?.url ?? "/images/placeholder.svg";

  const variantPricesUSD = (product.variants ?? []).map((v) => v.priceUSD ?? product.priceUSD);
  const variantPricesEUR = (product.variants ?? []).map((v) => v.priceEUR ?? product.priceEUR);
  const minUSD = Math.min(product.priceUSD, ...variantPricesUSD);
  const minEUR = Math.min(product.priceEUR, ...variantPricesEUR);
  const fromPrice =
    variantPricesUSD.some((p) => p !== product.priceUSD) ||
    variantPricesEUR.some((p) => p !== product.priceEUR);

  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={first?.alt ?? product.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second.url}
            alt={second.alt ?? product.name}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="pt-3 text-center">
        <h3 className="text-sm font-bold uppercase tracking-wide group-hover:text-brand-700">
          {product.name}
        </h3>
        {product.color && <p className="mt-0.5 text-xs text-neutral-500">{product.color}</p>}
        <div className="mt-1 flex items-baseline justify-center gap-1">
          {fromPrice && <span className="text-xs text-neutral-500">Dès</span>}
          <Price
            usd={fromPrice ? minUSD : product.priceUSD}
            eur={fromPrice ? minEUR : product.priceEUR}
            compareUSD={product.comparePriceUSD}
            compareEUR={product.comparePriceEUR}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}
