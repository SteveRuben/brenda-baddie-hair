"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { count } = useCart();
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
