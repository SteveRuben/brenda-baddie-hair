"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { count } = useCart();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = role === "customer";
  const isLoggedIn = !!session?.user;
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
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
          <Link
            href="/panier"
            className="relative rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Panier
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-800 text-xs font-bold">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
