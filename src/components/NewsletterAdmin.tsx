"use client";

import { useState } from "react";

type Subscriber = { id: string; email: string; createdAt: string };

function escapeCsv(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

// Tableau des abonnés avec export CSV et suppression.
export default function NewsletterAdmin({
  subscribers: initial,
}: {
  subscribers: Subscriber[];
}) {
  const [subscribers, setSubscribers] = useState(initial);

  function exportCsv() {
    const rows = ["email,date_inscription"];
    for (const s of subscribers) {
      rows.push(`${escapeCsv(s.email)},${escapeCsv(s.createdAt.slice(0, 10))}`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "abonnes-newsletter.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet abonné ?")) return;
    const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
    if (res.ok) setSubscribers((l) => l.filter((s) => s.id !== id));
  }

  return (
    <div>
      <button
        type="button"
        onClick={exportCsv}
        disabled={subscribers.length === 0}
        className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        Exporter en CSV ({subscribers.length})
      </button>
      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-semibold">Email</th>
              <th className="px-4 py-2 font-semibold">Inscrit le</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-neutral-100">
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 text-neutral-500">
                  {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  Aucun abonné pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
