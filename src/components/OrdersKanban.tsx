"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUSD, formatEUR } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/orderLabels";
import type { OrderStatusInfo } from "@/lib/orderStatuses";

export interface KanbanOrder {
  id: string;
  number: string;
  customerName: string;
  totalUSD: number;
  totalEUR: number;
  createdAt: string;
  paymentStatus: string;
  status: string;
}

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-neutral-200 text-neutral-700",
};

export default function OrdersKanban({
  initialOrders,
  initialStatuses,
  protectedKey,
}: {
  initialOrders: KanbanOrder[];
  initialStatuses: OrderStatusInfo[];
  protectedKey: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#64748b");

  async function moveOrder(orderId: string, newStatus: string) {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOrders(prev);
      setError("Déplacement impossible, la commande est restée à sa place.");
    }
  }

  function onDrop(e: React.DragEvent, statusKey: string) {
    e.preventDefault();
    setDragOver(null);
    const orderId = e.dataTransfer.getData("text/plain");
    if (orderId) moveOrder(orderId, statusKey);
  }

  async function addColumn() {
    const label = newLabel.trim();
    if (!label) return;
    setError("");
    try {
      const res = await fetch("/api/admin/order-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, color: newColor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setStatuses((ss) => [...ss, { key: data.status.key, label: data.status.label, color: data.status.color, position: data.status.position }]);
      setNewLabel("");
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajout impossible.");
    }
  }

  async function renameColumn(key: string) {
    const label = editLabel.trim();
    if (!label) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/order-statuses/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setStatuses((ss) => ss.map((s) => (s.key === key ? { ...s, label: data.status.label } : s)));
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Renommage impossible.");
    }
  }

  async function recolorColumn(key: string, color: string) {
    setError("");
    const prev = statuses;
    setStatuses((ss) => ss.map((s) => (s.key === key ? { ...s, color } : s)));
    try {
      const res = await fetch(`/api/admin/order-statuses/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (!res.ok) throw new Error("Couleur non enregistrée.");
    } catch {
      setStatuses(prev);
      setError("Couleur non enregistrée.");
    }
  }

  async function shiftColumn(key: string, dir: -1 | 1) {
    const idx = statuses.findIndex((s) => s.key === key);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= statuses.length) return;
    const prev = statuses;
    const reordered = [...statuses];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    setStatuses(reordered);
    setError("");
    try {
      const res = await fetch("/api/admin/order-statuses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((s) => s.key) }),
      });
      if (!res.ok) throw new Error("Ordre non enregistré.");
    } catch {
      setStatuses(prev);
      setError("Ordre non enregistré.");
    }
  }

  async function deleteColumn(key: string) {
    if (!window.confirm("Supprimer cette colonne ? Les commandes devront être déplacées ailleurs avant.")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/order-statuses/${encodeURIComponent(key)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suppression impossible.");
      setStatuses((ss) => ss.filter((s) => s.key !== key));
      setOpenMenu(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((s) => {
          const colOrders = orders.filter((o) => o.status === s.key);
          return (
            <div
              key={s.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(s.key);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onDrop(e, s.key)}
              className={`w-[280px] shrink-0 rounded-2xl bg-neutral-100 p-3 ${
                dragOver === s.key ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <div className="relative mb-3 flex items-center gap-2 px-1">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                {editing === s.key ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") renameColumn(s.key);
                      if (e.key === "Escape") {
                        setEditLabel(s.label);
                        setEditing(null);
                      }
                    }}
                    onBlur={() => renameColumn(s.key)}
                    maxLength={40}
                    className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm font-bold"
                  />
                ) : (
                  <span className="flex-1 truncate text-sm font-extrabold">{s.label}</span>
                )}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-neutral-600">
                  {colOrders.length}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === s.key ? null : s.key)}
                  className="rounded-lg px-2 py-1 text-lg font-bold leading-none text-neutral-500 hover:bg-white"
                  aria-label="Options de la colonne"
                >
                  ⋯
                </button>
                {openMenu === s.key && (
                  <div className="absolute right-0 top-9 z-10 w-48 rounded-xl bg-white p-2 shadow-lg ring-1 ring-neutral-200">
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100"
                      onClick={() => {
                        setEditLabel(s.label);
                        setEditing(s.key);
                        setOpenMenu(null);
                      }}
                    >
                      Renommer
                    </button>
                    <label className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-neutral-100">
                      Couleur
                      <input
                        type="color"
                        value={s.color}
                        onChange={(e) => recolorColumn(s.key, e.target.value)}
                        className="h-7 w-10 cursor-pointer rounded"
                      />
                    </label>
                    <div className="flex gap-1 px-3 py-2">
                      <button
                        type="button"
                        disabled={statuses[0]?.key === s.key}
                        onClick={() => shiftColumn(s.key, -1)}
                        className="flex-1 rounded-lg bg-neutral-100 py-1 text-sm font-bold disabled:opacity-40"
                        aria-label="Déplacer la colonne vers la gauche"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={statuses[statuses.length - 1]?.key === s.key}
                        onClick={() => shiftColumn(s.key, 1)}
                        className="flex-1 rounded-lg bg-neutral-100 py-1 text-sm font-bold disabled:opacity-40"
                        aria-label="Déplacer la colonne vers la droite"
                      >
                        →
                      </button>
                    </div>
                    {s.key !== protectedKey && (
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => deleteColumn(s.key)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {colOrders.map((o) => (
                  <div
                    key={o.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", o.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <Link href={`/admin/commandes/${o.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold">{o.number}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            PAYMENT_BADGE[o.paymentStatus] ?? "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {PAYMENT_LABELS[o.paymentStatus] ?? o.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-neutral-600">{o.customerName}</p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatUSD(o.totalUSD)} / {formatEUR(o.totalEUR)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </Link>
                    <select
                      aria-label="Déplacer vers"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) moveOrder(o.id, e.target.value);
                        e.target.value = "";
                      }}
                      className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs"
                    >
                      <option value="">Déplacer vers…</option>
                      {statuses
                        .filter((st) => st.key !== o.status)
                        .map((st) => (
                          <option key={st.key} value={st.key}>
                            {st.label}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <p className="rounded-xl border-2 border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-400">
                    Glissez une commande ici
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div className="w-[280px] shrink-0">
          {adding ? (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Nom de la colonne"
                maxLength={40}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                Couleur
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded"
                />
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={addColumn}
                  className="flex-1 rounded-full bg-brand-600 py-2 text-sm font-bold text-white hover:bg-brand-700"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-sm font-bold text-neutral-500 hover:border-brand-400 hover:text-brand-600"
            >
              + Ajouter une colonne
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
