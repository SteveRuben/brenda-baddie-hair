"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedDemoVariantsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function run() {
    if (!confirm("Appliquer les variantes démo (type + taille) aux produits de démonstration ? Leurs variantes actuelles seront remplacées.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-demo-variants", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; updated?: number; variants?: number; error?: string };
      if (res.ok && data.ok) {
        setDone(`${data.updated} produit(s), ${data.variants} variante(s)`);
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
    return <span className="text-sm font-semibold text-green-700">Variantes démo appliquées ✓ ({done})</span>;
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      title="Remplace les variantes des produits démo par les variantes type + taille des données de démonstration"
      className="rounded-full border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
    >
      {loading ? "Application…" : "Appliquer les variantes démo"}
    </button>
  );
}
