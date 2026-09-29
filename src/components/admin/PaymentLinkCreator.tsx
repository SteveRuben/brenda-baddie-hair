"use client";

import { useMemo, useState } from "react";

export interface CreatorVariant {
  id: string;
  name: string;
  type: string | null;
  priceUSD: number | null;
  priceEUR: number | null;
  stock: number;
}

export interface CreatorProduct {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  stock: number;
  variants: CreatorVariant[];
}

interface SelectedItem {
  key: string;
  productId: string;
  variantId?: string;
  label: string;
  quantity: number;
  priceUSD: number;
  priceEUR: number;
}

function variantLabel(v: CreatorVariant): string {
  const t = v.type?.trim();
  return `${t ? `${t}, ` : ""}${v.name}`;
}

export default function PaymentLinkCreator({ products }: { products: CreatorProduct[] }) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; number: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const variant = useMemo(
    () => product?.variants.find((v) => v.id === variantId),
    [product, variantId]
  );

  const currentPriceUSD = variant?.priceUSD ?? product?.priceUSD ?? 0;
  const currentPriceEUR = variant?.priceEUR ?? product?.priceEUR ?? 0;
  const currentStock = variant?.stock ?? product?.stock ?? 0;

  function addItem() {
    if (!product) return;
    if (product.variants.length > 0 && !variant) {
      setError("Choisissez une variante (type / taille).");
      return;
    }
    const q = Math.max(1, Math.min(99, Math.floor(qty) || 1));
    if (currentStock < q) {
      setError(`Stock insuffisant : ${currentStock} disponible(s).`);
      return;
    }
    const key = `${product.id}__${variant?.id ?? ""}`;
    setError("");
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(99, i.quantity + q) } : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id,
          label: variant ? `${product.name} — ${variantLabel(variant)}` : product.name,
          quantity: q,
          priceUSD: currentPriceUSD,
          priceEUR: currentPriceEUR,
        },
      ];
    });
    setQty(1);
  }

  const totalUSD = items.reduce((s, i) => s + i.priceUSD * i.quantity, 0);
  const totalEUR = items.reduce((s, i) => s + i.priceEUR * i.quantity, 0);

  async function createLink() {
    if (items.length === 0) {
      setError("Ajoutez au moins un article.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          note: note.trim() || undefined,
          expiresInDays,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Création impossible.");
      setResult({ url: data.url as string, number: data.number as string });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copie impossible : sélectionnez le lien manuellement.");
    }
  }

  function reset() {
    setItems([]);
    setCustomerName("");
    setNote("");
    setExpiresInDays(7);
    setResult(null);
    setError("");
    setProductId("");
    setVariantId("");
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-ink-950 focus:outline-none";

  if (result) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold">Lien créé — commande {result.number}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Envoyez ce lien à la cliente (ex. via WhatsApp). Il expire automatiquement.
        </p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={result.url} className={inputCls + " font-mono text-xs"} onFocus={(e) => e.target.select()} />
          <button
            onClick={copyLink}
            className="shrink-0 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-800"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <button onClick={reset} className="mt-4 text-sm font-semibold text-neutral-600 hover:underline">
          Créer un autre lien
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-bold">Créer un lien de paiement</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_100px_auto]">
        <select
          className={inputCls}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setVariantId("");
          }}
        >
          <option value="">Choisir un produit…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {product && product.variants.length > 0 ? (
          <select className={inputCls} value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            <option value="">Choisir la variante…</option>
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {variantLabel(v)} — {v.stock <= 0 ? "épuisé" : `${v.stock} disp.`}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center px-1 text-sm text-neutral-400">Sans variante</div>
        )}
        <input
          className={inputCls}
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          aria-label="Quantité"
        />
        <button
          onClick={addItem}
          disabled={!product}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
        >
          Ajouter
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <tbody>
              {items.map((i) => (
                <tr key={i.key} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2 font-semibold">{i.label}</td>
                  <td className="px-3 py-2 text-neutral-500">× {i.quantity}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {(i.priceUSD * i.quantity).toFixed(2)} $ / {(i.priceEUR * i.quantity).toFixed(2)} €
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setItems((prev) => prev.filter((x) => x.key !== i.key))}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-neutral-50 font-extrabold">
                <td className="px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2 text-right">
                  {totalUSD.toFixed(2)} $ / {totalEUR.toFixed(2)} €
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          className={inputCls}
          placeholder="Nom de la cliente (optionnel)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Note interne (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Valide</span>
          <input
            className={inputCls + " w-20"}
            type="number"
            min={1}
            max={90}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value) || 7)}
          />
          <span className="text-neutral-500">jours</span>
        </label>
      </div>

      <button
        onClick={createLink}
        disabled={creating || items.length === 0}
        className="mt-4 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
      >
        {creating ? "Création…" : "Générer le lien de paiement"}
      </button>
    </div>
  );
}
