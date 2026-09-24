"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
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
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-lg">
        <p className="text-6xl font-extrabold text-brand-200">500</p>
        <h1 className="mt-3 text-xl font-extrabold text-brand-700">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Quelque chose s'est mal passé. Réessayez dans un instant.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700"
          >
            Réessayer
          </button>
          <Link href="/admin" className="text-sm font-semibold text-brand-700 hover:underline">
            Retour au backoffice
          </Link>
        </div>
      </div>
    </div>
  );
}
