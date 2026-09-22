"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Tous statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Tous paiements" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payé" },
  { value: "failed", label: "Échoué" },
  { value: "refunded", label: "Remboursé" },
];

export default function OrdersFilters({ current }: { current: Record<string, string | undefined> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/admin/commandes?${sp.toString()}`);
  }

  const inputCls =
    "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <input
        defaultValue={current.q ?? ""}
        placeholder="N° commande, nom, email…"
        className={inputCls}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
        }}
      />
      <select
        defaultValue={current.status ?? ""}
        className={inputCls}
        onChange={(e) => update("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        defaultValue={current.payment ?? ""}
        className={inputCls}
        onChange={(e) => update("payment", e.target.value)}
      >
        {PAYMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        defaultValue={current.from ?? ""}
        className={inputCls}
        onChange={(e) => update("from", e.target.value)}
        title="À partir du"
      />
      <input
        type="date"
        defaultValue={current.to ?? ""}
        className={inputCls}
        onChange={(e) => update("to", e.target.value)}
        title="Jusqu'au"
      />
      <a
        href="/api/admin/export/orders"
        className="rounded-lg border border-brand-300 px-3 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
      >
        Export CSV
      </a>
    </div>
  );
}
