"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

export default function OrderStatusForm({
  orderId,
  status,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  carrier: string;
  trackingNumber: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ status, carrier, trackingNumber });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Statut mis à jour.");
      router.refresh();
    } else {
      setMessage("Erreur lors de la mise à jour.");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={save} className="mt-3 grid gap-3">
      <label className="block text-sm font-semibold">
        Statut
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-semibold">
          Transporteur
          <input
            className={inputCls}
            value={form.carrier}
            onChange={(e) => setForm({ ...form, carrier: e.target.value })}
            placeholder="DHL, FedEx…"
          />
        </label>
        <label className="block text-sm font-semibold">
          N° de suivi
          <input
            className={inputCls}
            value={form.trackingNumber}
            onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-6 py-2.5 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
        >
          {saving ? "…" : "Mettre à jour"}
        </button>
        {message && <span className="text-sm text-neutral-600">{message}</span>}
      </div>
    </form>
  );
}
