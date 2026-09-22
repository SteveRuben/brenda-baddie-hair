"use client";

import { useCart } from "@/lib/cart";

interface SimpleProduct {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image?: string;
  priceUSD: number;
  priceEUR: number;
}

export default function AddToCart({
  product,
  disabled,
}: {
  product: SimpleProduct;
  disabled?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <button
      disabled={disabled}
      onClick={() => addItem(product, 1)}
      className="w-full rounded-full bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {disabled ? "Rupture de stock" : "Ajouter au panier"}
    </button>
  );
}
