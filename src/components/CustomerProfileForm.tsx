"use client";

import { useState } from "react";

const inputCls =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

export default function CustomerProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState({
    firstName: initial.firstName,
    lastName: initial.lastName,
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    city: initial.city ?? "",
    postalCode: initial.postalCode ?? "",
    country: initial.country ?? "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/compte/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      setMessage("Profil mis à jour.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-bold">Mes informations</h2>
      {message && (
        <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm font-semibold text-brand-700">
          {message}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">
          Prénom *
          <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} />
        </label>
        <label className="text-sm font-semibold">
          Nom *
          <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 text-sm font-semibold">
          Email
          <input value={initial.email} disabled className={inputCls + " bg-neutral-100 text-neutral-500"} />
        </label>
        <label className="col-span-2 text-sm font-semibold">
          Téléphone
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 text-sm font-semibold">
          Adresse
          <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
        </label>
        <label className="text-sm font-semibold">
          Ville
          <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
        </label>
        <label className="text-sm font-semibold">
          Code postal
          <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 text-sm font-semibold">
          Pays
          <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
      >
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
