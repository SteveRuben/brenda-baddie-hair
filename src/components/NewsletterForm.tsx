"use client";

import { useState } from "react";

type Props = { variant?: "section" | "footer" };

// Bloc d'inscription à la newsletter (inspiré de la section newsletter
// de nandiswigs.com). Appelle POST /api/newsletter.
export default function NewsletterForm({ variant = "section" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue.");
        return;
      }
      setStatus("done");
      setMessage("Merci ! Vous êtes bien inscrite à la newsletter.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Service indisponible, réessayez plus tard.");
    }
  }

  if (variant === "footer") {
    return (
      <div>
        <h3 className="font-extrabold uppercase tracking-wide">
          Inscrivez-vous à la newsletter
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          Soyez la première informée de nos nouveautés et offres exclusives.
        </p>
        {status === "done" ? (
          <p className="mt-3 text-sm font-semibold text-brand-400">{message}</p>
        ) : (
          <form onSubmit={submit} className="mt-3">
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                aria-label="Adresse email"
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {status === "loading" ? "…" : "OK"}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-2 text-sm text-red-400">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide">
          Restez informée
        </h2>
        <p className="mt-2 text-neutral-600">
          Nouveautés, offres exclusives et conseils capillaires — directement
          dans votre boîte mail.
        </p>
        {status === "done" ? (
          <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700">
            {message}
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-5 flex max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              aria-label="Adresse email"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {status === "loading" ? "…" : "S'inscrire"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm font-semibold text-red-600">{message}</p>
        )}
      </div>
    </section>
  );
}
