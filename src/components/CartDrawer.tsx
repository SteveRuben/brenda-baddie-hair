"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function BagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Mini-panier coulissant (slide-over) : s'ouvre automatiquement à chaque
 * ajout au panier et affiche les articles avec leurs visuels, comme sur les
 * sites e-commerce classiques.
 */
export default function CartDrawer() {
  const {
    items,
    count,
    subtotalUSD,
    subtotalEUR,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Fond assombri */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panneau latéral */}
      <aside
        role="dialog"
        aria-label="Mini panier"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <h2 className="text-lg font-extrabold">
            Votre panier{" "}
            <span className="ml-1 rounded-full bg-brand-600 px-2.5 py-0.5 text-sm font-bold text-white">
              {count}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="rounded-full bg-brand-50 p-5 text-brand-600">
              <BagIcon className="h-10 w-10" />
            </span>
            <p className="text-lg font-bold">Votre panier est vide</p>
            <p className="text-sm text-neutral-500">
              Découvrez nos perruques premium.
            </p>
            <Link
              href="/catalogue"
              onClick={closeCart}
              className="mt-2 rounded-full bg-brand-600 px-8 py-3 font-bold text-white hover:bg-brand-700"
            >
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}::${item.variantId ?? ""}`}
                  className="flex gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
                >
                  <Link
                    href={`/produit/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image ?? "/images/placeholder.svg"}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl bg-brand-50 object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produit/${item.slug}`}
                      onClick={closeCart}
                      className="block truncate text-sm font-bold hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {format(item.priceUSD, item.priceEUR)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity + 1
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 font-bold"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-1 text-xs text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-brand-700">
                    {format(item.priceUSD * item.quantity, item.priceEUR * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-100 px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Sous-total</span>
                <span className="font-extrabold text-brand-700">
                  {format(subtotalUSD, subtotalEUR)}
                </span>
              </div>
              <Link
                href="/panier"
                onClick={closeCart}
                className="mt-3 block rounded-full border-2 border-brand-600 py-2.5 text-center font-bold text-brand-700 hover:bg-brand-50"
              >
                Voir le panier
              </Link>
              <Link
                href="/commande"
                onClick={closeCart}
                className="mt-2 block rounded-full bg-brand-600 py-3 text-center font-bold text-white hover:bg-brand-700"
              >
                Passer commande
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
