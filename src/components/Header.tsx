"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart";
import { BagIcon } from "./CartDrawer";

export default function Header() {
  const { count, openCart } = useCart();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = role === "customer";
  const isLoggedIn = !!session?.user;
  const [menuOpen, setMenuOpen] = useState(false);

  const links: NavItem[] = [
    { href: "/", label: "Accueil" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/contact", label: "Contact" },
  ];

  interface NavItem {
    href: string;
    label: string;
    action?: () => void;
  }

  const accountLinks: NavItem[] = isCustomer
    ? [
        { href: "/compte", label: "Mon compte" },
        { href: "#deconnexion", label: "Déconnexion", action: () => signOut({ callbackUrl: "/" }) },
      ]
    : [{ href: "/compte/connexion", label: isLoggedIn ? "Mon compte" : "Se connecter" }];

  return (
    <div className="sticky top-0 z-40">
      {/* Barre utilitaire au-dessus du header : panier à droite */}
      <div className="bg-brand-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-1.5">
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
            <span className="text-xs font-bold uppercase tracking-wide">Panier</span>
          </button>
        </div>
      </div>
      <header className="border-b border-brand-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="whitespace-nowrap text-lg font-extrabold tracking-tight text-brand-700 md:text-xl"
          >
            Brenda <span className="text-brand-500">Baddie</span> Hair
          </Link>
          {/* Navigation bureau */}
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brand-600">
                {l.label}
              </Link>
            ))}
            {accountLinks.map((l) =>
              l.action ? (
                <button key={l.label} onClick={l.action} className="hover:text-brand-600">
                  {l.label}
                </button>
              ) : (
                <Link key={l.href} href={l.href} className="hover:text-brand-600">
                  {l.label}
                </Link>
              )
            )}
          </nav>
          {/* Bouton hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-brand-700 hover:bg-brand-50 md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        {/* Menu mobile déroulant */}
        {menuOpen && (
          <nav className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
            {[...links, ...accountLinks].map((l) =>
              l.action ? (
                <button
                  key={l.label}
                  onClick={() => {
                    setMenuOpen(false);
                    l.action?.();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium hover:bg-brand-50 hover:text-brand-600"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium hover:bg-brand-50 hover:text-brand-600"
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>
        )}
      </header>
    </div>
  );
}
