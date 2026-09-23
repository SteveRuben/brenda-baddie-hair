"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalUSD, subtotalEUR } = useCart();
  const { format } = useCurrency();
  const [shipping, setShipping] = useState({ usd: 0, eur: 0 });

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => setShipping({ usd: d.shippingFeeUSD ?? 0, eur: d.shippingFeeEUR ?? 0 }))
      .catch(() => {});
  }, []);

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
              src={item.image ?? "/images/placeholder.svg"}
              alt={item.name}
              className="h-24 w-24 rounded-xl bg-brand-50 object-cover"
            />
            <div className="flex-1">
              <Link href={`/produit/${item.slug}`} className="font-bold hover:text-brand-700">
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500">
                {format(item.priceUSD, item.priceEUR)}
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
              {format(item.priceUSD * item.quantity, item.priceEUR * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-brand-50 p-6">
        <div className="flex justify-between text-sm">
          <span>Sous-total</span>
          <span className="font-semibold">
            {format(subtotalUSD, subtotalEUR)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span>Livraison</span>
          <span className="font-semibold">
            {format(shipping.usd, shipping.eur)}
          </span>
        </div>
        <div className="mt-3 flex justify-between border-t border-brand-100 pt-3 text-lg font-extrabold">
          <span>Total estimé</span>
          <span className="text-brand-700">
            {format(subtotalUSD + shipping.usd, subtotalEUR + shipping.eur)}
          </span>
        </div>
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
