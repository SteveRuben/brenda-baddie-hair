"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/lib/currency";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

interface PayerClientProps {
  token: string;
  siteName: string;
  order: {
    id: string;
    number: string;
    items: { name: string; quantity: number; priceUSD: number; priceEUR: number }[];
    totalUSD: number;
    totalEUR: number;
  };
  customer: { firstName: string; lastName: string; email: string; phone: string };
}

interface PaymentMethod {
  key: string;
  label: string;
}

/**
 * Page de paiement d'un lien partagé : le client vérifie son identité,
 * choisit son moyen de paiement, puis paie via les flux existants
 * (PayPal / Stripe), cléés sur l'orderId — aucune commande en double.
 */
export default function PayerClient({ token, siteName, order, customer }: PayerClientProps) {
  const { format } = useCurrency();
  const router = useRouter();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"infos" | "paiement">("infos");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [method, setMethod] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
  });

  useEffect(() => {
    fetch("/api/public/payments")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.methods ?? []) as PaymentMethod[];
        setMethods(list);
        if (list.length === 1) setMethod(list[0].key);
      })
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveIdentity() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Veuillez renseigner votre prénom, nom et email.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/payer/${token}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      setOrderId(data.orderId as string);
      setStep("paiement");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
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
        body: JSON.stringify({ orderId, cancelPath: `/payer/${token}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Stripe indisponible.");
      if (data.alreadyPaid) {
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

  const inputCls =
    "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-ink-950 focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400">{siteName}</p>
      <h1 className="mt-1 text-3xl font-extrabold">Paiement de votre commande</h1>
      <p className="mt-1 text-sm text-neutral-500">Commande {order.number}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl bg-ink-50 p-5">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between py-1 text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span className="font-semibold">{format(i.priceUSD * i.quantity, i.priceEUR * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 font-extrabold">
          <span>Total à payer</span>
          <span className="text-ink-950">{format(order.totalUSD, order.totalEUR)}</span>
        </div>
      </div>

      {step === "infos" && (
        <div className="mt-6">
          <h2 className="font-bold">Vos informations</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Prénom *" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            <input className={inputCls} placeholder="Nom *" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            <input className={inputCls + " col-span-2"} placeholder="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <input className={inputCls + " col-span-2"} placeholder="Téléphone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <button
            onClick={saveIdentity}
            disabled={saving}
            className="mt-4 w-full rounded-full bg-ink-950 py-3 font-bold text-white hover:bg-ink-800 disabled:bg-neutral-300"
          >
            {saving ? "Enregistrement…" : "Continuer vers le paiement"}
          </button>
        </div>
      )}

      {step === "paiement" && (
        <div className="mt-6">
          <h2 className="font-bold">Paiement sécurisé</h2>
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
              Le paiement en ligne n'est pas encore configuré. Nous vous contacterons pour le règlement.
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
