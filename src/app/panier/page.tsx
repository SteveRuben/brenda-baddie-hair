"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatUSD, formatEUR } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalUSD, subtotalEUR } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Votre panier est vide</h1>
        <p className="mt-2 text-neutral-500">Découvrez nos perruques premium.</p>
        <Link
          href="/catalogue"
          className="mt-6 inline-block rounded-full bg-brand-600 px-8 py-3 font-bold text-white hover:bg-brand-700"
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Panier</h1>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? ""}`}
            className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image ?? "/images/placeholder.png"}
              alt={item.name}
              className="h-24 w-24 rounded-xl bg-brand-50 object-cover"
            />
            <div className="flex-1">
              <Link href={`/produit/${item.slug}`} className="font-bold hover:text-brand-700">
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500">
                {formatUSD(item.priceUSD)} / {formatEUR(item.priceEUR)}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 font-bold"
                >
                  −
                </button>
                <span className="font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
            <p className="font-extrabold text-brand-700">
              {formatUSD(item.priceUSD * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-brand-50 p-6">
        <div className="flex justify-between text-lg font-extrabold">
          <span>Sous-total</span>
          <span className="text-brand-700">
            {formatUSD(subtotalUSD)} / {formatEUR(subtotalEUR)}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">Frais de livraison calculés à la commande.</p>
        <Link
          href="/commande"
          className="mt-4 block rounded-full bg-brand-600 py-3 text-center font-bold text-white hover:bg-brand-700"
        >
          Passer commande
        </Link>
      </div>
    </div>
  );
}
