import Link from "next/link";

export const metadata = { title: "Page introuvable — BBH Admin", robots: "noindex" };

export default function RootNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-lg">
        <p className="text-6xl font-extrabold text-brand-200">404</p>
        <h1 className="mt-3 text-xl font-extrabold text-brand-700">Page introuvable</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/admin"
            className="rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
          >
            Retour au backoffice
          </Link>
          <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">
            Voir le site
          </Link>
        </div>
      </div>
    </div>
  );
}
