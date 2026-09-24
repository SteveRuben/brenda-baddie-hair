"use client";

import { useState } from "react";

const FIELDS: { key: string; label: string; type: "text" | "textarea" | "number" | "checkbox" | "image" }[] = [
  { key: "siteName", label: "Nom de la boutique", type: "text" },
  { key: "heroTitle", label: "Titre bannière d'accueil", type: "text" },
  { key: "heroSubtitle", label: "Sous-titre bannière d'accueil", type: "textarea" },
  { key: "heroImageUrl", label: "Image de la bannière d'accueil", type: "image" },
  { key: "announcementTitle", label: "Titre du bloc d'information (accueil)", type: "text" },
  { key: "announcementText", label: "Texte du bloc d'information — vide = masqué (**gras** possible)", type: "textarea" },
  { key: "aboutTitle", label: "Titre section À propos", type: "text" },
  { key: "aboutText", label: "Texte section À propos", type: "textarea" },
  { key: "instagramUrl", label: "Lien Instagram", type: "text" },
  { key: "tiktokUrl", label: "Lien TikTok", type: "text" },
  { key: "facebookUrl", label: "Lien Facebook", type: "text" },
  { key: "youtubeUrl", label: "Lien YouTube", type: "text" },
  { key: "whatsappNumber", label: "Numéro WhatsApp (format international, ex. 14165551234)", type: "text" },
  { key: "whatsappChatEnabled", label: "Afficher la bulle de discussion WhatsApp", type: "checkbox" },
  { key: "whatsappChatMessage", label: "Message pré-rempli de la bulle WhatsApp", type: "textarea" },
  { key: "contactEmail", label: "Email de contact", type: "text" },
  { key: "shippingFeeUSD", label: "Frais de livraison — USD", type: "number" },
  { key: "shippingFeeEUR", label: "Frais de livraison — EUR", type: "number" },
  { key: "legalMentions", label: "Mentions légales", type: "textarea" },
  { key: "cgv", label: "Conditions générales de vente (CGV)", type: "textarea" },
];

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadHeroImage(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.urls?.[0]) throw new Error(json.error || "Upload impossible.");
      setForm((f) => ({ ...f, heroImageUrl: json.urls[0] }));
      setMessage("Image téléversée — n'oubliez pas d'enregistrer.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

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
          ) : f.type === "image" ? (
            <div key={f.key} className="block text-sm font-semibold">
              {f.label}
              {form[f.key] ? (
                <img
                  src={form[f.key]}
                  alt="Aperçu de la bannière"
                  className="mt-2 h-32 w-full rounded-lg border border-neutral-200 object-cover"
                />
              ) : (
                <p className="mt-2 text-xs font-normal text-neutral-500">
                  Aucune image — la bannière garde son dégradé rouge actuel.
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-full bg-neutral-100 px-5 py-2 text-xs font-bold hover:bg-neutral-200">
                  {uploading ? "Téléversement…" : "Choisir une image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadHeroImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {form[f.key] && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, [f.key]: "" })}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Retirer l'image
                  </button>
                )}
              </div>
              <input
                className={inputCls}
                type="text"
                placeholder="…ou coller une URL d'image"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
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
