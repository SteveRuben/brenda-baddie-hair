"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart";
import { useCurrency, type Currency } from "@/lib/currency";
import { BagIcon } from "./CartDrawer";

function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const options: { value: Currency; label: string }[] = [
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
  ];
  return (
    <div
      className="flex items-center rounded-full bg-white/15 p-0.5 text-xs font-bold"
      role="group"
      aria-label="Devise d'affichage"
      title="Devise détectée selon votre zone géographique"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setCurrency(o.value)}
          aria-pressed={currency === o.value}
          className={`rounded-full px-2.5 py-1 transition ${
            currency === o.value
              ? "bg-white text-brand-700 shadow"
              : "text-white/80 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { count, openCart } = useCart();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = role === "customer";
  const isLoggedIn = !!session?.user;
  return (
    <div className="sticky top-0 z-40">
      {/* Barre utilitaire au-dessus du header : panier à gauche */}
      <div className="bg-brand-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
            title="Panier"
            className="relative flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/10"
          >
            <span className="relative rounded-full bg-white p-2 text-brand-700">
              <BagIcon className="h-4 w-4" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-extrabold text-white shadow ring-2 ring-brand-700">
                {count}
              </span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wide">
              Panier
            </span>
          </button>
          <CurrencyToggle />
        </div>
      </div>
      <header className="border-b border-brand-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-700">
            Brenda <span className="text-brand-500">Baddie</span> Hair
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="hover:text-brand-600">
              Accueil
            </Link>
            <Link href="/catalogue" className="hover:text-brand-600">
              Catalogue
            </Link>
            <Link href="/#contact" className="hover:text-brand-600">
              Contact
            </Link>
            {isCustomer ? (
              <>
                <Link href="/compte" className="hover:text-brand-600">
                  Mon compte
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-brand-600"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link href="/compte/connexion" className="hover:text-brand-600">
                {isLoggedIn ? "Mon compte" : "Se connecter"}
              </Link>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}
