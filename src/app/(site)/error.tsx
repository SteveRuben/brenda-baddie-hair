"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-brand-200">500</p>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-700">Une erreur est survenue</h1>
      <p className="mt-2 text-neutral-500">
        Quelque chose s'est mal passé de notre côté. Réessayez dans un instant.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-full border border-brand-200 px-6 py-3 font-bold text-brand-700 hover:bg-brand-50"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
