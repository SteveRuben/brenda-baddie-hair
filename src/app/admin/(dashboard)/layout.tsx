import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-lg font-extrabold text-brand-700">
            BBH — Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {session && (
              <>
                <Link href="/admin" className="hover:text-brand-600">Tableau de bord</Link>
                <Link href="/admin/produits" className="hover:text-brand-600">Produits</Link>
                <Link href="/admin/commandes" className="hover:text-brand-600">Commandes</Link>
                <Link href="/admin/newsletter" className="hover:text-brand-600">Newsletter</Link>
                <Link href="/admin/parametres" className="hover:text-brand-600">Paramètres</Link>
                <Link href="/admin/utilisateurs" className="hover:text-brand-600">Utilisateurs</Link>
                <Link href="/" className="hover:text-brand-600">Voir le site</Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/admin/login" });
                  }}
                >
                  <button className="text-red-600 hover:underline">Déconnexion</button>
                </form>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!session ? redirect("/admin/login") : children}
      </main>
    </div>
  );
}
