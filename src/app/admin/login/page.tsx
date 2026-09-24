"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => setSetupNeeded((d as { needed?: boolean }).needed === true))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-extrabold text-brand-700">Backoffice</h1>
        <p className="mt-1 text-sm text-neutral-500">Brenda Baddie Hair — Administration</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {setupNeeded && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Aucun compte administrateur pour le moment.{" "}
            <Link href="/admin/setup" className="font-bold underline hover:text-amber-900">
              Créer le premier compte
            </Link>
          </p>
        )}
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
