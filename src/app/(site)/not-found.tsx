import Link from "next/link";

export const metadata = { title: "Page introuvable — bree baddie hair" };

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-700">Page introuvable</h1>
      <p className="mt-2 text-neutral-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/catalogue"
          className="rounded-full border border-brand-200 px-6 py-3 font-bold text-brand-700 hover:bg-brand-50"
        >
          Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
