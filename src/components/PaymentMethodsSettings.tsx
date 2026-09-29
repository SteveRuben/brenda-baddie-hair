"use client";

import { useEffect, useState } from "react";

interface MethodStatus {
  key: string;
  label: string;
  description: string;
  configured: boolean;
  enabled: boolean;
  manageable: boolean;
}

export default function PaymentMethodsSettings({ webhookUrl }: { webhookUrl: string }) {
  const [methods, setMethods] = useState<MethodStatus[] | null>(null);
  const [stripeOn, setStripeOn] = useState(false);
  const [publishableKey, setPublishableKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.methods) {
          setMethods(d.methods);
          const stripe = d.methods.find((m: MethodStatus) => m.key === "stripe");
          if (stripe) setStripeOn(stripe.enabled);
        }
      })
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s) setPublishableKey(s.stripePublishableKey ?? "");
      })
      .catch(() => {});
  }, []);

  async function saveStripe() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeEnabled: stripeOn ? "true" : "false",
          stripePublishableKey: publishableKey.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      const d = await fetch("/api/admin/payments").then((r) => r.json());
      if (d?.methods) setMethods(d.methods);
      setMessage("Paramètres Stripe enregistrés.");
    } catch {
      setMessage("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {methods === null && <p className="text-sm text-neutral-500">Chargement…</p>}
      {methods?.map((m) => (
        <div key={m.key} className="rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">{m.label}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{m.description}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                m.enabled
                  ? "bg-green-100 text-green-800"
                  : m.configured
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {m.enabled ? "Activé" : m.configured ? "Configuré — désactivé" : "Non configuré"}
            </span>
          </div>

          {m.key === "stripe" && (
            <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-brand-600"
                  checked={stripeOn}
                  onChange={(e) => setStripeOn(e.target.checked)}
                />
                Activer le paiement par carte (Stripe)
              </label>
              <label className="block text-sm font-semibold">
                Clé publique Stripe
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  type="text"
                  placeholder="pk_test_… ou pk_live_…"
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </label>
              <p className="text-xs leading-relaxed text-neutral-500">
                La clé secrète (<span className="font-mono">STRIPE_SECRET_KEY</span>) et le secret
                du webhook (<span className="font-mono">STRIPE_WEBHOOK_SECRET</span>) ne se
                saisissent jamais ici : ajoutez-les dans Railway → Variables. Déclarez ensuite
                cette URL dans le dashboard Stripe (Développeurs → Webhooks, événement{" "}
                <span className="font-mono">checkout.session.completed</span>) :
              </p>
              <p className="break-all rounded-lg bg-neutral-100 px-3 py-2 font-mono text-xs">
                {webhookUrl}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveStripe}
                  disabled={saving}
                  className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
                >
                  {saving ? "Enregistrement…" : "Enregistrer Stripe"}
                </button>
                {message && <span className="text-sm text-neutral-600">{message}</span>}
              </div>
            </div>
          )}

          {m.key === "paypal" && (
            <p className="mt-3 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-500">
              PayPal est actif dès que ses clés sont posées dans Railway → Variables :{" "}
              <span className="font-mono">PAYPAL_CLIENT_ID</span>,{" "}
              <span className="font-mono">PAYPAL_CLIENT_SECRET</span>,{" "}
              <span className="font-mono">PAYPAL_MODE</span> (sandbox / live), et{" "}
              <span className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</span> pour la vitrine.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
