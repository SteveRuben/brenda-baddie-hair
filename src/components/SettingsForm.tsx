"use client";

import { useState } from "react";

const FIELDS: { key: string; label: string; type: "text" | "textarea" | "number" | "checkbox" }[] = [
  { key: "siteName", label: "Nom de la boutique", type: "text" },
  { key: "heroTitle", label: "Titre bannière d'accueil", type: "text" },
  { key: "heroSubtitle", label: "Sous-titre bannière d'accueil", type: "textarea" },
  { key: "aboutTitle", label: "Titre section À propos", type: "text" },
  { key: "aboutText", label: "Texte section À propos", type: "textarea" },
  { key: "instagramUrl", label: "Lien Instagram", type: "text" },
  { key: "tiktokUrl", label: "Lien TikTok", type: "text" },
  { key: "facebookUrl", label: "Lien Facebook", type: "text" },
  { key: "youtubeUrl", label: "Lien YouTube", type: "text" },
  { key: "whatsappNumber", label: "Numéro WhatsApp (format international, ex. 14165551234)", type: "text" },
  { key: "whatsappChatEnabled", label: "Afficher la bulle de discussion WhatsApp", type: "checkbox" },
  { key: "whatsappChatMessage", label: "Message pré-rempli de la bulle WhatsApp", type: "textarea" },
  { key: "shippingFeeUSD", label: "Frais de livraison — USD", type: "number" },
  { key: "shippingFeeEUR", label: "Frais de livraison — EUR", type: "number" },
  { key: "legalMentions", label: "Mentions légales", type: "textarea" },
  { key: "cgv", label: "Conditions générales de vente (CGV)", type: "textarea" },
];

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setMessage("Paramètres enregistrés.");
    } catch {
      setMessage("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={save} className="max-w-3xl">
      <div className="grid gap-5">
        {FIELDS.map((f) =>
          f.type === "checkbox" ? (
            <label
              key={f.key}
              className="flex cursor-pointer items-center gap-3 text-sm font-semibold"
            >
              <input
                type="checkbox"
                className="h-5 w-5 accent-brand-600"
                checked={form[f.key] === "true"}
                onChange={(e) =>
                  setForm({ ...form, [f.key]: e.target.checked ? "true" : "false" })
                }
              />
              {f.label}
            </label>
          ) : (
            <label key={f.key} className="block text-sm font-semibold">
              {f.label}
              {f.type === "textarea" ? (
                <textarea
                  className={inputCls}
                  rows={4}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  className={inputCls}
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  step={f.type === "number" ? "0.01" : undefined}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </label>
          )
        )}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-8 py-3 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && <span className="text-sm text-neutral-600">{message}</span>}
      </div>
    </form>
  );
}
