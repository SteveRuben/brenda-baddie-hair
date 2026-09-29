import { prisma } from "@/lib/prisma";
import { stripeClient } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/fulfillOrder";

export const dynamic = "force-dynamic";

// Webhook Stripe : NE PAS parser le corps en JSON avant — la vérification
// de la signature exige le corps brut exact. req.text() le fournit tel quel.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!signature || !webhookSecret) {
    console.error("[stripe] webhook appelé sans signature ou sans STRIPE_WEBHOOK_SECRET.");
    return new Response("Signature manquante.", { status: 400 });
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    // Jamais de log du corps ni de la signature ici.
    console.error("[stripe] signature webhook invalide.");
    return new Response("Signature invalide.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { orderId?: string };
      payment_status?: string;
      amount_total?: number | null;
    };
    const orderId = session.metadata?.orderId;
    // Idempotence : sans orderId ou commande déjà payée, on acquitte sans rien faire.
    if (!orderId) return new Response("OK", { status: 200 });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    // Commande inconnue : acquitter (200) plutôt que de faire réessayer
    // Stripe indéfiniment — un retry ne la fera pas apparaître.
    if (!order) {
      console.error(`[stripe] commande inconnue dans le webhook : ${orderId}`);
      return new Response("OK", { status: 200 });
    }
    if (order.paymentStatus === "paid") return new Response("OK", { status: 200 });

    // Sécurité : le montant encaissé doit correspondre au total de la commande
    // (tolérance d'1 centime pour les arrondis), comme pour PayPal.
    const paidCents = session.amount_total;
    const expectedCents = Math.round(order.totalUSD * 100);
    if (paidCents == null || Math.abs(paidCents - expectedCents) > 1) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "failed" },
      });
      console.error(
        `[stripe] montant incohérent pour la commande ${order.number} : ${paidCents} vs ${expectedCents} centimes.`
      );
      return new Response("Montant incorrect.", { status: 400 });
    }

    const fulfilled = await fulfillOrder(orderId);
    if (!fulfilled.ok) {
      console.error(`[stripe] finalisation impossible : ${fulfilled.reason}`);
      return new Response("Finalisation impossible.", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
