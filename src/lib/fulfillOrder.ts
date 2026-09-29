import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/mail";
import { getSetting } from "@/lib/settings";

export type FulfillResult = { ok: true; number: string } | { ok: false; reason: string };

/**
 * Finalise une commande payée : la réclame (paymentStatus pending → paid,
 * status → confirmed), décrémente le stock au niveau fin (variante si
 * l'article en a une, sinon produit) avec garde anti-survente, puis envoie
 * l'email de confirmation (non bloquant).
 *
 * Idempotent : si la commande est déjà payée, ne fait rien et renvoie son
 * numéro. La réclamation se fait en UPDATE … WHERE paymentStatus='pending'
 * dans la transaction, donc deux confirmations concurrentes (webhook +
 * page de retour, par ex.) ne peuvent pas décrémenter le stock deux fois.
 */
export async function fulfillOrder(orderId: string): Promise<FulfillResult> {
  try {
    const claimed = await prisma.$transaction(async (tx) => {
      const r = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: "pending" },
        data: { paymentStatus: "paid", status: "confirmed" },
      });
      if (r.count === 0) {
        const existing = await tx.order.findUnique({
          where: { id: orderId },
          select: { paymentStatus: true, number: true },
        });
        if (existing?.paymentStatus === "paid") {
          return { alreadyPaid: true as const, number: existing.number, order: null };
        }
        throw new Error("Commande introuvable ou déjà traitée.");
      }
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true, customer: true },
      });
      // Décrément atomique du stock avec garde anti-survente :
      // si le stock est insuffisant au moment du paiement, la commande échoue
      // proprement au lieu de passer en stock négatif.
      for (const item of order.items) {
        if (item.variantId) {
          const u = await tx.variant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (u.count === 0) throw new Error(`Stock insuffisant pour ${item.name}`);
        } else {
          const u = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (u.count === 0) throw new Error(`Stock insuffisant pour ${item.name}`);
        }
      }
      return { alreadyPaid: false as const, number: order.number, order };
    });

    if (claimed.alreadyPaid || !claimed.order) {
      return { ok: true, number: claimed.number };
    }
    const order = claimed.order;

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

    return { ok: true, number: claimed.number };
  } catch (e) {
    console.error("[fulfill]", e);
    return { ok: false, reason: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}
