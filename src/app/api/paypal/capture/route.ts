import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder, paypalConfigured } from "@/lib/paypal";
import { sendOrderConfirmation } from "@/lib/mail";
import { getSetting } from "@/lib/settings";
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

      // Décrément atomique du stock avec garde anti-survente :
      // si le stock est insuffisant au moment du paiement, la commande échoue
      // proprement au lieu de passer en stock négatif.
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "paid", status: "confirmed" },
        });
        for (const item of order.items) {
          const r = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (r.count === 0) {
            throw new Error(`Stock insuffisant pour ${item.name}`);
          }
        }
      });

      // Email de confirmation (non bloquant)
      const siteName = await getSetting("siteName");
      sendOrderConfirmation({
        number: order.number,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceUSD: i.priceUSD,
          priceEUR: i.priceEUR,
        })),
        subtotalUSD: order.subtotalUSD,
        subtotalEUR: order.subtotalEUR,
        shippingUSD: order.shippingUSD,
        shippingEUR: order.shippingEUR,
        totalUSD: order.totalUSD,
        totalEUR: order.totalEUR,
        siteName,
      }).catch((e) => console.error("[mail]", e));

      return NextResponse.json({ number: order.number });
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
