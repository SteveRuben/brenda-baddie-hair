"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "employe" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Création impossible.");
      setForm({ email: "", name: "", password: "", role: "employe" });
      setMessage("Compte créé.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Supprimer le compte ${email} ?`)) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setMessage("Compte supprimé.");
      load();
    } else {
      setMessage(data.error ?? "Suppression impossible.");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Comptes existants</h2>
        <div className="mt-3 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-sm">
              <div>
                <p className="font-bold">{u.email}</p>
                <p className="text-neutral-500">
                  {u.name ? `${u.name} — ` : ""}{u.role === "admin" ? "Administrateur" : "Employé"}
                </p>
              </div>
              <button
                onClick={() => remove(u.id, u.email)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-neutral-500">Aucun compte.</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Créer un compte</h2>
        <form onSubmit={create} className="mt-4 grid max-w-xl gap-3">
          <input
            className={inputCls}
            placeholder="Email *"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Nom (optionnel)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Mot de passe (8 caractères min) *"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className={inputCls}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employe">Employé — accès boutique et commandes</option>
            <option value="admin">Administrateur — accès complet</option>
          </select>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand-600 px-6 py-2.5 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
            >
              {loading ? "…" : "Créer le compte"}
            </button>
            {message && <span className="text-sm text-neutral-600">{message}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
