"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedDemoImagesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-demo-images", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; updated?: number; error?: string };
      if (res.ok && data.ok) {
        setDone(true);
        router.refresh();
      } else {
        alert(data.error ?? "Opération impossible.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="text-sm font-semibold text-green-700">Visuels démo ajoutés ✓</span>;
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      title="Ajoute les photos de démonstration aux produits démo qui n'en ont pas encore"
      className="rounded-full border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
    >
      {loading ? "Ajout…" : "Charger les visuels démo"}
    </button>
  );
}
