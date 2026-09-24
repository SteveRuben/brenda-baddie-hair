"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import Price from "./Price";

interface Variant {
  id: string;
  name: string;
  type: string | null;
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

  // Regroupement des variantes par type (ex. Glueless, Frontal).
  // Les variantes sans type vont dans le groupe "Standard".
  const STANDARD = "Standard";
  const typeGroups = new Map<string, Variant[]>();
  for (const v of product.variants) {
    const t = v.type?.trim() || STANDARD;
    const list = typeGroups.get(t) ?? [];
    list.push(v);
    typeGroups.set(t, list);
  }
  const types = [...typeGroups.keys()];
  // On n'affiche l'étape "Type" que si plusieurs types existent,
  // ou si un seul type coexiste avec des variantes sans type.
  const hasTypeStep =
    types.length > 1 || (types.length === 1 && types[0] !== STANDARD && product.variants.some((v) => !(v.type?.trim())));

  const [selectedType, setSelectedType] = useState<string>(types[0] ?? STANDARD);
  const [variantId, setVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const visibleVariants = hasTypeStep ? typeGroups.get(selectedType) ?? [] : product.variants;
  const variant = product.variants.find((v) => v.id === variantId);
  const variantType = variant?.type?.trim() || null;
  const priceUSD = variant?.priceUSD ?? product.priceUSD;
  const priceEUR = variant?.priceEUR ?? product.priceEUR;
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;

  function selectType(t: string) {
    setSelectedType(t);
    setVariantId("");
  }

  function handleAdd() {
    const label = variantType ? `${variantType}, ${variant!.name}` : variant!.name;
    addItem(
      {
        productId: product.productId,
        variantId: variant?.id,
        name: variant ? `${product.name} — ${label}` : product.name,
        slug: product.slug,
        image: product.image,
        priceUSD,
        priceEUR,
      },
      quantity
    );
    // Le mini-panier s'ouvre automatiquement via addItem : pas de redirection.
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
          {hasTypeStep && (
            <div>
              <p className="text-sm font-semibold">Type de produit</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => selectType(t)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedType === t
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-neutral-200 hover:border-brand-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={hasTypeStep ? "mt-4" : ""}>
            <p className="text-sm font-semibold">Taille</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleVariants.map((v) => (
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
        <button
          type="button"
          disabled={soldOut || (product.variants.length > 0 && !variant)}
          onClick={handleAdd}
          className={btnCls}
        >
          {soldOut ? "Rupture de stock" : product.variants.length > 0 && !variant ? "Choisissez une taille" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
