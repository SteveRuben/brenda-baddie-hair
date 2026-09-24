import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configuration initiale — BBH Admin",
  robots: "noindex, nofollow",
};

export default async function AdminSetupPage() {
  let userCount = 1;
  try {
    userCount = await prisma.user.count();
  } catch {
    // BD injoignable : on n'affiche pas le formulaire (fail closed).
    userCount = 1;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {userCount === 0 ? (
        <SetupForm />
      ) : (
        <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-brand-700">Déjà configuré</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Un compte administrateur existe déjà sur cette boutique.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
          >
            Aller à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}
