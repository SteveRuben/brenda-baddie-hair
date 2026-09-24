"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart";
import { BagIcon } from "./CartDrawer";
import Logo from "./Logo";

type CategoryLink = { name: string; slug: string };

export default function Header({
  siteName,
  categories,
}: {
  siteName: string;
  categories: CategoryLink[];
}) {
  const { count, openCart } = useCart();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = role === "customer";
  const isLoggedIn = !!session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const collectionSubmenu: NavItem[] = [
    { href: "/collection", label: "Toutes les collections" },
    ...categories.map((c) => ({
      href: `/collection?categorie=${encodeURIComponent(c.slug)}`,
      label: c.name,
    })),
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
          <Link href="/" aria-label={siteName} className="inline-block py-0.5">
            <Logo name={siteName} />
          </Link>
          {/* Navigation bureau */}
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-brand-600">
              Accueil
            </Link>
            {/* Menu déroulant "Collections" (façon Nandi's Wigs) */}
            <div className="group relative">
              <Link
                href="/collection"
                className="flex items-center gap-1 hover:text-brand-600"
              >
                Collections
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 transition group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 pt-2 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="overflow-hidden rounded-xl border border-brand-100 bg-white py-2 shadow-lg">
                  {collectionSubmenu.map((s) => (
                    <Link
                      key={s.href + s.label}
                      href={s.href}
                      className="block whitespace-nowrap px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/contact" className="hover:text-brand-600">
              Contact
            </Link>
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
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium hover:bg-brand-50 hover:text-brand-600"
            >
              Accueil
            </Link>
            {/* Sous-menu Collections */}
            <button
              type="button"
              onClick={() => setCollectionsOpen((v) => !v)}
              aria-expanded={collectionsOpen}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-medium hover:bg-brand-50 hover:text-brand-600"
            >
              Collections
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition ${collectionsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {collectionsOpen && (
              <div className="ml-3 border-l-2 border-brand-100 pl-3">
                {collectionSubmenu.map((s) => (
                  <Link
                    key={s.href + s.label}
                    href={s.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium hover:bg-brand-50 hover:text-brand-600"
            >
              Contact
            </Link>
            {accountLinks.map((l) =>
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
