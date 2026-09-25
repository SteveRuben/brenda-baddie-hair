"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputCls =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-ink-950 focus:outline-none";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/compte/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inscription impossible.");
      const login = await signIn("customer", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      if (login?.error) throw new Error("Compte créé, mais connexion impossible. Réessayez.");
      router.push("/compte");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-extrabold text-ink-950">Créer un compte</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Suivez vos commandes et téléchargez vos factures.
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Prénom *
            <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} />
          </label>
          <label className="text-sm font-semibold">
            Nom *
            <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="mt-3 block text-sm font-semibold">
          Email *
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Mot de passe * (8 caractères minimum)
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Déjà cliente ?{" "}
          <Link href="/compte/connexion" className="font-semibold text-ink-900 hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
