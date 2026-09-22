import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder, paypalConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    if (!paypalConfigured()) {
      return NextResponse.json({ error: "PayPal n'est pas configuré." }, { status: 500 });
    }
    const { orderId } = (await req.json()) as { orderId: string };
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    const result = await createPaypalOrder(order.totalUSD.toFixed(2), order.number);
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
