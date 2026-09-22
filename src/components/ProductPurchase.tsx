"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import Price from "./Price";

interface Variant {
  id: string;
  name: string;
  priceUSD: number | null;
  priceEUR: number | null;
  stock: number;
}

interface ProductInfo {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  priceUSD: number;
  priceEUR: number;
  comparePriceUSD?: number | null;
  comparePriceEUR?: number | null;
  stock: number;
  variants: Variant[];
  whatsappNumber?: string;
}

export default function ProductPurchase({ product }: { product: ProductInfo }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId);
  const priceUSD = variant?.priceUSD ?? product.priceUSD;
  const priceEUR = variant?.priceEUR ?? product.priceEUR;
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.productId,
        variantId: variant?.id,
        name: variant ? `${product.name} — ${variant.name}` : product.name,
        slug: product.slug,
        image: product.image,
        priceUSD,
        priceEUR,
      },
      quantity
    );
    router.push("/panier");
  }

  const btnCls =
    "w-full rounded-full bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-300";

  return (
    <div>
      <Price
        usd={priceUSD}
        eur={priceEUR}
        compareUSD={product.comparePriceUSD}
        compareEUR={product.comparePriceEUR}
        size="lg"
      />

      {product.variants.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold">Variante</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVariantId("")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                variantId === ""
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-neutral-200 hover:border-brand-400"
              }`}
            >
              Standard
            </button>
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                  variantId === v.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-200 hover:border-brand-400"
                }`}
              >
                {v.name}
                {v.stock <= 0 ? " (épuisé)" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <div>
          <p className="text-sm font-semibold">Quantité</p>
          <div className="mt-2 flex items-center rounded-full border border-neutral-200">
            <button
              type="button"
              aria-label="Diminuer"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-lg font-bold text-brand-700"
            >
              −
            </button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button
              type="button"
              aria-label="Augmenter"
              onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
              className="px-4 py-2 text-lg font-bold text-brand-700"
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          {soldOut ? "Rupture de stock" : `${stock} disponible(s)`}
        </p>
      </div>

      <div className="mt-6">
        <button type="button" disabled={soldOut} onClick={handleAdd} className={btnCls}>
          {soldOut ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
