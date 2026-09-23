"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatUSD, formatEUR } from "@/lib/format";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

export default function CheckoutPage() {
  const { items, subtotalUSD, subtotalEUR, clear } = useCart();
  const router = useRouter();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [shipping, setShipping] = useState({ usd: 0, eur: 0 });

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => setShipping({ usd: d.shippingFeeUSD ?? 0, eur: d.shippingFeeEUR ?? 0 }))
      .catch(() => {});
    // Client connecté : pré-remplit le formulaire avec son profil
    fetch("/api/compte/profil")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p) {
          setForm((f) => ({
            ...f,
            firstName: p.firstName ?? f.firstName,
            lastName: p.lastName ?? f.lastName,
            email: p.email ?? f.email,
            phone: p.phone ?? f.phone,
            address: p.address ?? f.address,
            city: p.city ?? f.city,
            postalCode: p.postalCode ?? f.postalCode,
            country: p.country ?? f.country,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const totalUSD = subtotalUSD + shipping.usd;
  const totalEUR = subtotalEUR + shipping.eur;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function createOrder() {
    if (!form.firstName || !form.lastName || !form.email || items.length === 0) {
      setError("Veuillez remplir vos informations et ajouter des produits au panier.");
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la commande.");
      setOrderId(data.orderId);
      return data.orderId as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!orderId || !PAYPAL_CLIENT_ID || !paypalRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.onload = renderButtons;
      document.body.appendChild(script);
    } else {
      renderButtons();
    }
    function renderButtons() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paypal = (window as any).paypal;
      if (!paypal || !paypalRef.current) return;
      paypalRef.current.innerHTML = "";
      paypal
        .Buttons({
          async createOrder() {
            const res = await fetch("/api/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "PayPal indisponible.");
            return data.paypalOrderId;
          },
          async onApprove(data: { orderID: string }) {
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, paypalOrderId: data.orderID }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error ?? "Paiement refusé.");
            clear();
            router.push(`/confirmation/${result.number}`);
          },
          onError(err: unknown) {
            console.error(err);
            setError("Le paiement PayPal a échoué. Réessayez.");
          },
        })
        .render(paypalRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (items.length === 0 && !orderId) router.push("/panier");
  }, [items.length, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (items.length === 0 && !orderId) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Commande</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      {!orderId ? (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-bold">Vos informations</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Prénom *" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              <input className={inputCls} placeholder="Nom *" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              <input className={inputCls + " col-span-2"} placeholder="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <input className={inputCls + " col-span-2"} placeholder="Téléphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <input className={inputCls + " col-span-2"} placeholder="Adresse" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <input className={inputCls} placeholder="Ville" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <input className={inputCls} placeholder="Code postal" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              <input className={inputCls + " col-span-2"} placeholder="Pays" value={form.country} onChange={(e) => set("country", e.target.value)} />
              <textarea className={inputCls + " col-span-2"} placeholder="Instructions particulières (optionnel)" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>
          <div>
            <h2 className="font-bold">Récapitulatif</h2>
            <div className="mt-3 space-y-2 rounded-2xl bg-brand-50 p-5">
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantId ?? ""}`} className="flex justify-between text-sm">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span className="font-semibold">{formatUSD(i.priceUSD * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-brand-100 pt-3 text-sm">
                <span>Sous-total</span>
                <span className="font-semibold">{formatUSD(subtotalUSD)} / {formatEUR(subtotalEUR)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span className="font-semibold">{formatUSD(shipping.usd)} / {formatEUR(shipping.eur)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-100 pt-3 font-extrabold">
                <span>Total</span>
                <span className="text-brand-700">
                  {formatUSD(totalUSD)} / {formatEUR(totalEUR)}
                </span>
              </div>
            </div>
            <button
              onClick={createOrder}
              disabled={loading}
              className="mt-4 w-full rounded-full bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 disabled:bg-neutral-300"
            >
              {loading ? "Création…" : "Continuer vers le paiement"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 max-w-md">
          <h2 className="font-bold">Paiement sécurisé via PayPal</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Total à payer : {formatUSD(totalUSD)} / {formatEUR(totalEUR)}
          </p>
          {!PAYPAL_CLIENT_ID && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Le paiement en ligne n'est pas encore configuré. Votre commande est enregistrée, nous
              vous contacterons pour le règlement.
            </p>
          )}
          <div ref={paypalRef} className="mt-4" />
        </div>
      )}
    </div>
  );
}
