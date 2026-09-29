import { paypalConfigured } from "@/lib/paypal";
import { stripeConfigured } from "@/lib/stripe";
import { getSetting } from "@/lib/settings";

// Registre des moyens de paiement. Pour en ajouter un nouveau :
// 1. ajouter une entrée ci-dessous,
// 2. exposer son statut dans getPaymentMethodStatus(),
// 3. brancher son flux (création + confirmation) sur fulfillOrder().

export interface PaymentMethodDef {
  key: string;
  label: string;
  description: string;
}

export const PAYMENT_METHOD_DEFS: PaymentMethodDef[] = [
  {
    key: "paypal",
    label: "PayPal",
    description: "Paiement via PayPal (compte PayPal ou carte via PayPal).",
  },
  {
    key: "stripe",
    label: "Carte bancaire",
    description: "Paiement par carte (Visa, Mastercard…) via Stripe.",
  },
];

export interface PaymentMethodStatus extends PaymentMethodDef {
  /** Secrets présents (variables d'environnement). */
  configured: boolean;
  /** Activé et utilisable par les clients. */
  enabled: boolean;
  /** Peut être activé/coupé depuis le backoffice. */
  manageable: boolean;
}

export async function stripeToggleOn(): Promise<boolean> {
  return (await getSetting("stripeEnabled")) === "true";
}

/** Statut complet des moyens de paiement (backoffice). */
export async function getPaymentMethodStatus(): Promise<PaymentMethodStatus[]> {
  const stripeOn = await stripeToggleOn();
  const paypalOk = paypalConfigured();
  const stripeOk = stripeConfigured();
  return [
    {
      ...PAYMENT_METHOD_DEFS[0],
      configured: paypalOk,
      // PayPal n'a pas d'interrupteur : il est actif dès que ses clés sont posées.
      enabled: paypalOk,
      manageable: false,
    },
    {
      ...PAYMENT_METHOD_DEFS[1],
      configured: stripeOk,
      enabled: stripeOn && stripeOk,
      manageable: true,
    },
  ];
}

export interface PublicPaymentMethod {
  key: string;
  label: string;
  /** Clé publique Stripe (publique par nature), uniquement quand Stripe est actif. */
  publishableKey?: string;
}

/** Méthodes activées, exposées au tunnel de commande (aucun secret). */
export async function getEnabledPaymentMethods(): Promise<PublicPaymentMethod[]> {
  const all = await getPaymentMethodStatus();
  const out: PublicPaymentMethod[] = [];
  for (const m of all) {
    if (!m.enabled) continue;
    if (m.key === "stripe") {
      out.push({
        key: m.key,
        label: m.label,
        publishableKey: (await getSetting("stripePublishableKey")) || undefined,
      });
    } else {
      out.push({ key: m.key, label: m.label });
    }
  }
  return out;
}
