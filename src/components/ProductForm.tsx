"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/format";

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  color: string;
  size: string;
  priceUSD: string;
  priceEUR: string;
  comparePriceUSD: string;
  comparePriceEUR: string;
  stock: string;
  status: string;
  featured: boolean;
  images: string[];
}

const EMPTY: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  color: "",
  size: "",
  priceUSD: "",
  priceEUR: "",
  comparePriceUSD: "",
  comparePriceEUR: "",
  stock: "0",
  status: "draft",
  featured: false,
  images: [],
};

export default function ProductForm({ initial }: { initial?: Partial<ProductFormData> }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY, ...initial } as ProductFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload impossible.");
      setForm((f) => ({ ...f, images: [...f.images, ...data.urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        priceUSD: Number(form.priceUSD),
        priceEUR: Number(form.priceEUR),
        comparePriceUSD: form.comparePriceUSD ? Number(form.comparePriceUSD) : null,
        comparePriceEUR: form.comparePriceEUR ? Number(form.comparePriceEUR) : null,
        stock: Number(form.stock),
      };
      const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form.id || !confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/produits");
      router.refresh();
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  const labelCls = "block text-sm font-semibold";

  return (
    <form onSubmit={save} className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">{form.id ? "Modifier le produit" : "Nouveau produit"}</h1>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className={labelCls}>
          Nom *
          <input className={inputCls} required value={form.name} onChange={(e) => { set("name", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} />
        </label>
        <label className={labelCls}>
          Slug
          <input className={inputCls} value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </label>
        <label className={`${labelCls} md:col-span-2`}>
          Description
          <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className={labelCls}>
          Marque
          <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
        </label>
        <label className={labelCls}>
          Couleur
          <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
        </label>
        <label className={labelCls}>
          Taille / Longueur
          <input className={inputCls} value={form.size} onChange={(e) => set("size", e.target.value)} />
        </label>
        <label className={labelCls}>
          Statut
          <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Brouillon</option>
            <option value="active">Actif</option>
            <option value="archived">Archivé</option>
          </select>
        </label>
        <label className={labelCls}>
          Prix USD *
          <input className={inputCls} required type="number" min="0" step="0.01" value={form.priceUSD} onChange={(e) => set("priceUSD", e.target.value)} />
        </label>
        <label className={labelCls}>
          Prix EUR *
          <input className={inputCls} required type="number" min="0" step="0.01" value={form.priceEUR} onChange={(e) => set("priceEUR", e.target.value)} />
        </label>
        <label className={labelCls}>
          Prix barré USD
          <input className={inputCls} type="number" min="0" step="0.01" value={form.comparePriceUSD} onChange={(e) => set("comparePriceUSD", e.target.value)} />
        </label>
        <label className={labelCls}>
          Prix barré EUR
          <input className={inputCls} type="number" min="0" step="0.01" value={form.comparePriceEUR} onChange={(e) => set("comparePriceEUR", e.target.value)} />
        </label>
        <label className={labelCls}>
          Stock
          <input className={inputCls} type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Produit vedette (accueil)
        </label>
      </div>

      <div className="mt-6">
        <p className={labelCls}>Photos</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {form.images.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-24 rounded-xl bg-brand-50 object-cover" />
              <button
                type="button"
                onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-brand-500">
            {uploading ? "…" : "+"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={upload} />
          </label>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-brand-600 px-8 py-3 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {form.id && (
          <button type="button" onClick={remove} className="rounded-full border border-red-200 px-6 py-3 font-bold text-red-600 hover:bg-red-50">
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
