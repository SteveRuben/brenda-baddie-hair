"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputCls =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-ink-950 focus:outline-none";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("customer", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/compte");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-extrabold text-ink-950">Mon compte</h1>
        <p className="mt-1 text-sm text-neutral-500">Connectez-vous pour suivre vos commandes.</p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        )}
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Pas encore de compte ?{" "}
          <Link href="/compte/inscription" className="font-semibold text-ink-900 hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
