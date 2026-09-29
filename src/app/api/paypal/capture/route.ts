import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder, paypalConfigured } from "@/lib/paypal";
import { fulfillOrder } from "@/lib/fulfillOrder";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

function capturedAmountUSD(capture: unknown): number | null {
  try {
    const c = capture as {
      purchaseUnits?: Array<{
        payments?: { captures?: Array<{ amount?: { value?: string } }> };
      }>;
    };
    const v = c.purchaseUnits?.[0]?.payments?.captures?.[0]?.amount?.value;
    return v != null ? Number(v) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "paypal-capture"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  try {
    if (!paypalConfigured()) {
      return NextResponse.json({ error: "PayPal n'est pas configuré." }, { status: 500 });
    }
    const { orderId, paypalOrderId } = (await req.json()) as {
      orderId: string;
      paypalOrderId: string;
    };
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    // Idempotence : une commande déjà payée ne repasse pas par la capture
    // (rejouer l'appel ne doit pas la marquer "failed").
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ number: order.number });
    }

    // Le paypalOrderId DOIT être celui généré côté serveur pour cette commande.
    // Sinon un attaquant pourrait faire capturer un paiement PayPal moins cher
    // (créé par lui) et faire marquer sa commande comme payée.
    if (!order.paypalOrderId || order.paypalOrderId !== paypalOrderId) {
      return NextResponse.json({ error: "Transaction PayPal invalide." }, { status: 400 });
    }

    const capture = await capturePaypalOrder(paypalOrderId);
    const status = capture.status;

    if (status === "COMPLETED") {
      // Vérifie que le montant capturé correspond au total de la commande.
      const captured = capturedAmountUSD(capture);
      if (captured == null || Math.abs(captured - order.totalUSD) > 0.009) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "failed" },
        });
        return NextResponse.json({ error: "Montant du paiement incorrect." }, { status: 400 });
      }

      // Finalisation partagée (réclamation idempotente, stock, email).
      const fulfilled = await fulfillOrder(orderId);
      if (!fulfilled.ok) {
        return NextResponse.json({ error: `Paiement reçu mais finalisation impossible : ${fulfilled.reason}` }, { status: 500 });
      }
      return NextResponse.json({ number: fulfilled.number });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "failed" },
    });
    return NextResponse.json({ error: "Le paiement n'a pas abouti." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur lors de la capture PayPal." }, { status: 500 });
  }
}
