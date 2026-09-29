import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeClient, stripeConfigured } from "@/lib/stripe";
import { stripeToggleOn } from "@/lib/payments";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "stripe-session"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  try {
    if (!(await stripeToggleOn()) || !stripeConfigured()) {
      return NextResponse.json(
        { error: "Le paiement par carte n'est pas activé." },
        { status: 400 }
      );
    }
    const { orderId } = (await req.json()) as { orderId: string };
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ alreadyPaid: true, number: order.number });
    }
    if (order.paymentStatus !== "pending") {
      return NextResponse.json({ error: "Cette commande a déjà été traitée." }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || req.headers.get("origin") || "";
    if (!baseUrl) {
      return NextResponse.json({ error: "URL du site non configurée." }, { status: 500 });
    }

    // Facturation en USD (comme PayPal) : montants entiers en centimes.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map(
      (i) => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name },
          unit_amount: Math.round(i.priceUSD * 100),
        },
        quantity: i.quantity,
      })
    );
    if (order.shippingUSD > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Livraison" },
          unit_amount: Math.round(order.shippingUSD * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: order.customer.email,
      metadata: { orderId: order.id, orderNumber: order.number },
      success_url: `${baseUrl}/confirmation/${order.number}?session_id={CHECKOUT_SESSION_ID}`,
      // En cas d'abandon, on revient avec l'orderId pour ne pas recréer
      // une commande en double.
      cancel_url: `${baseUrl}/commande?orderId=${order.id}`,
    });
    if (!session.url) {
      return NextResponse.json({ error: "Stripe n'a pas créé la session." }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur Stripe." }, { status: 500 });
  }
}
