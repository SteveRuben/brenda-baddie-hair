"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedProducts, setSeedProducts] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, seedProducts }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Création impossible.");
        setLoading(false);
        return;
      }
      // Connexion immédiate avec le compte qui vient d'être créé.
      const login = await signIn("credentials", { email: email.trim(), password, redirect: false });
      setLoading(false);
      if (login?.error) {
        router.push("/admin/login");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau, réessayez.");
      setLoading(false);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-extrabold text-brand-700">Configuration initiale</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez le premier compte administrateur de la boutique.
      </p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <label className="mt-6 block text-sm font-semibold">
        Nom
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Brenda" />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Mot de passe <span className="font-normal text-neutral-400">(8 caractères min)</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      </label>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg bg-neutral-50 p-3 text-sm">
        <input
          type="checkbox"
          checked={seedProducts}
          onChange={(e) => setSeedProducts(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="font-semibold">Charger 4 produits de démonstration</span>
          <br />
          <span className="text-neutral-500">Pour tester et valider la boutique rapidement. Modifiables ensuite dans Produits.</span>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
      >
        {loading ? "Création…" : "Créer le compte administrateur"}
      </button>
    </form>
  );
}
