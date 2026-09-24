import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder, paypalConfigured } from "@/lib/paypal";
import { getSetting } from "@/lib/settings";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "paypal-create"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  try {
    if (!paypalConfigured()) {
      return NextResponse.json({ error: "PayPal n'est pas configuré." }, { status: 500 });
    }
    const { orderId } = (await req.json()) as { orderId: string };
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    const siteName = await getSetting("siteName");
    const result = await createPaypalOrder(order.totalUSD.toFixed(2), order.number, siteName);
    const paypalOrderId = result.id;
    if (!paypalOrderId) {
      return NextResponse.json({ error: "PayPal n'a pas créé la transaction." }, { status: 500 });
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { paypalOrderId },
    });
    return NextResponse.json({ paypalOrderId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur PayPal." }, { status: 500 });
  }
}
