import Link from "next/link";

export const metadata = { title: "Page introuvable — bree baddie hair" };

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-ink-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink-950">Page introuvable</h1>
      <p className="mt-2 text-neutral-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink-950 px-6 py-3 font-bold text-white hover:bg-ink-800"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/collection"
          className="rounded-full border border-ink-300 px-6 py-3 font-bold text-ink-950 hover:bg-ink-100"
        >
          Voir la collection
        </Link>
      </div>
    </div>
  );
}
