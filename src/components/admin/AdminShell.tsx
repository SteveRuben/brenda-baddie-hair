"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Mail,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Structure de navigation du backoffice. Pour ajouter une section plus tard :
// ajouter un objet { href, label, icon } dans le groupe voulu (ou un nouveau groupe).
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
      { href: "/admin/produits", label: "Produits", icon: Package },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/admin/newsletter", label: "Newsletter", icon: Mail }],
  },
  {
    label: "Système",
    items: [
      { href: "/admin/parametres", label: "Paramètres", icon: Settings },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-6 last:mb-0">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_var(--color-brand-600)]"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function BrandMark() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-xl text-white">
        b
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold text-neutral-900">bree baddie hair</span>
        <span className="block text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Admin
        </span>
      </span>
    </Link>
  );
}

export default function AdminShell({
  role,
  signOutAction,
  children,
}: {
  role: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const roleLabel = role === "admin" ? "Administrateur" : "Employé";
  const currentSection =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => isActive(pathname, i))?.label ??
    "Administration";

  return (
    <div className="min-h-screen bg-neutral-50 lg:pl-64">
      {/* Barre latérale — bureau */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
        <BrandMark />
        <SidebarNav pathname={pathname} />
        <div className="border-t border-neutral-100 p-4">
          <p className="px-3 text-xs text-neutral-500">
            Connecté en tant que <span className="font-bold text-neutral-700">{roleLabel}</span>
          </p>
        </div>
      </aside>

      {/* Tiroir — mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pr-2">
              <BrandMark />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Barre supérieure fine */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="truncate text-sm font-bold text-neutral-800">{currentSection}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <span className="hidden rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 md:inline">
              {roleLabel}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
