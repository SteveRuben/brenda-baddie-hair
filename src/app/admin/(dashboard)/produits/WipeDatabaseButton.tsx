"use client";

import { useState } from "react";

export default function WipeDatabaseButton() {
  const [loading, setLoading] = useState(false);

  async function run() {
    if (
      !confirm(
        "DANGER : vider entièrement la base de données ?\n\nTOUT sera supprimé : produits, variantes, images, commandes, clients, abonnés newsletter, paramètres… et votre compte administrateur (vous serez déconnecté).\n\nLes 4 produits de démonstration « toutes tailles » seront rechargés juste après.",
      )
    ) {
      return;
    }
    if (!confirm("Dernière confirmation : vider vraiment toute la base maintenant ?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wipe-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "VIDER" }),
      });
      const data = (await res.json()) as { ok?: boolean; products?: number; error?: string };
      if (res.ok && data.ok) {
        alert(
          `Base vidée et ${data.products ?? 4} produits de démonstration rechargés.\n\nVotre compte admin a été supprimé : vous allez être redirigé vers la page de création du premier compte.`,
        );
        window.location.href = "/admin/setup";
      } else {
        alert(data.error ?? "Opération impossible.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      title="Vide entièrement la base de données puis recharge les 4 produits de démonstration toutes tailles"
      className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Vidage…" : "Vider la base et recharger les mocks"}
    </button>
  );
}
