"use client";

import { useState } from "react";

export interface LinkRow {
  id: string;
  number: string;
  token: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  totalUSD: number;
  totalEUR: number;
  paymentStatus: string;
  expired: boolean;
  createdAt: string;
  tokenExpiresAt: string | null;
}

const PAYMENT_BADGES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-neutral-200 text-neutral-700",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

export default function PaymentLinkList({
  initial,
  baseUrl,
}: {
  initial: LinkRow[];
  baseUrl: string;
}) {
  const [links, setLinks] = useState(initial);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function urlFor(token: string) {
    return baseUrl ? `${baseUrl}/payer/${token}` : `/payer/${token}`;
  }

  async function copy(token: string, id: string) {
    try {
      await navigator.clipboard.writeText(urlFor(token));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Copie impossible : copiez le lien depuis la fiche.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce lien de paiement ? La commande associée sera annulée.")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/payment-links/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible.");
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    }
  }

  if (links.length === 0) {
    return <p className="text-sm text-neutral-500">Aucun lien de paiement pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      )}
      {links.map((l) => (
        <div key={l.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-extrabold">{l.number}</span>
              <span className="ml-2 text-sm text-neutral-500">{l.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              {l.expired && l.paymentStatus === "pending" && (
                <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-bold text-neutral-600">
                  Expiré
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${PAYMENT_BADGES[l.paymentStatus] ?? PAYMENT_BADGES.pending}`}
              >
                {PAYMENT_LABELS[l.paymentStatus] ?? l.paymentStatus}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {l.items.map((i) => `${i.name} × ${i.quantity}`).join(" · ")}
          </p>
          <p className="mt-1 text-sm font-bold">
            {l.totalUSD.toFixed(2)} $ / {l.totalEUR.toFixed(2)} €
            <span className="ml-3 font-normal text-neutral-400">
              créé le {new Date(l.createdAt).toLocaleDateString("fr-FR")}
              {l.tokenExpiresAt &&
                ` · expire le ${new Date(l.tokenExpiresAt).toLocaleDateString("fr-FR")}`}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => copy(l.token, l.id)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold hover:border-neutral-500"
            >
              {copiedId === l.id ? "Copié !" : "Copier le lien"}
            </button>
            <a
              href={`/admin/commandes/${l.id}`}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold hover:border-neutral-500"
            >
              Voir la commande
            </a>
            {l.paymentStatus === "pending" && (
              <button
                onClick={() => remove(l.id)}
                className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 hover:border-red-400"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
