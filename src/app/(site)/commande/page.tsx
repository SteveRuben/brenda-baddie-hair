"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

interface PaymentMethod {
  key: string;
  label: string;
}

export default function CheckoutPage() {
  const { items, subtotalUSD, subtotalEUR, clear } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [method, setMethod] = useState<string | null>(null);
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
    // Retour d'un abandon Stripe : on reprend la commande existante
    // au lieu d'en recréer une en double.
    const params = new URLSearchParams(window.location.search);
    const resumed = params.get("orderId");
    if (resumed) setOrderId(resumed);
    // Moyens de paiement activés (registre côté serveur)
    fetch("/api/public/payments")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.methods ?? []) as PaymentMethod[];
        setMethods(list);
        if (list.length === 1) setMethod(list[0].key);
      })
      .catch(() => {});
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

  async function payWithStripe() {
    if (!orderId) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Stripe indisponible.");
      if (data.alreadyPaid) {
        clear();
        router.push(`/confirmation/${data.number}`);
        return;
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!orderId || method !== "paypal" || !PAYPAL_CLIENT_ID || !paypalRef.current) return;
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
  }, [orderId, method]);

  useEffect(() => {
    if (items.length === 0 && !orderId) router.push("/panier");
  }, [items.length, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-ink-950 focus:outline-none";

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
            <div className="mt-3 space-y-2 rounded-2xl bg-ink-50 p-5">
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantId ?? ""}`} className="flex justify-between text-sm">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span className="font-semibold">{format(i.priceUSD * i.quantity, i.priceEUR * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-200 pt-3 text-sm">
                <span>Sous-total</span>
                <span className="font-semibold">{format(subtotalUSD, subtotalEUR)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span className="font-semibold">{format(shipping.usd, shipping.eur)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-3 font-extrabold">
                <span>Total</span>
                <span className="text-ink-950">
                  {format(totalUSD, totalEUR)}
                </span>
              </div>
            </div>
            <button
              onClick={createOrder}
              disabled={loading}
              className="mt-4 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
            >
              {loading ? "Création…" : "Continuer vers le paiement"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 max-w-md">
          <h2 className="font-bold">Paiement sécurisé</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Total à payer : {format(totalUSD, totalEUR)}
          </p>
          {methods.length > 1 && (
            <div className="mt-4 space-y-2">
              {methods.map((m) => (
                <label
                  key={m.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
                    method === m.key
                      ? "border-ink-950 bg-ink-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    className="h-4 w-4 accent-neutral-950"
                    checked={method === m.key}
                    onChange={() => setMethod(m.key)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          )}
          {methods.length === 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Le paiement en ligne n'est pas encore configuré. Votre commande est enregistrée, nous
              vous contacterons pour le règlement.
            </p>
          )}
          {method === "paypal" && (
            <>
              {!PAYPAL_CLIENT_ID && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Le paiement PayPal n'est pas configuré pour le moment.
                </p>
              )}
              <div ref={paypalRef} className="mt-4" />
            </>
          )}
          {method === "stripe" && (
            <button
              onClick={payWithStripe}
              disabled={paying}
              className="mt-4 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
            >
              {paying ? "Redirection vers Stripe…" : "Payer par carte"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
