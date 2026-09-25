"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "bbh-cookie-consent";

// Bandeau de consentement cookies (RGPD) : affiché tant que le visiteur
// n'a pas fait son choix. Le panier utilise le stockage local (fonctionnel,
// exempté de consentement) ; PayPal et les réseaux sociaux déposent leurs
// propres cookies soumis à ce choix.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* stockage indisponible : on masque quand même */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          Nous utilisons des cookies pour faire fonctionner la boutique et, avec
          votre accord, mesurer l'audience.{" "}
          <Link href="/confidentialite" className="font-semibold text-ink-950 hover:underline">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-full bg-ink-950 px-5 py-2 text-sm font-bold text-white hover:bg-ink-800"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
