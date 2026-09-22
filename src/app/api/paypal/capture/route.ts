import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder } from "@/lib/paypal";
import { sendOrderConfirmation } from "@/lib/mail";
import { getSetting } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    const { orderId, paypalOrderId } = (await req.json()) as {
      orderId: string;
      paypalOrderId: string;
    };
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

    const capture = await capturePaypalOrder(paypalOrderId);
    const status = capture.status;

    if (status === "COMPLETED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "paid", status: "confirmed" },
        }),
        ...order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
      ]);

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
