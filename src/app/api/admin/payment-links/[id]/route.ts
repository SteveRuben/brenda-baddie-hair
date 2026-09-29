import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Supprime un lien de paiement non payé (et sa commande). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "payment-link-delete"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, paymentToken: true, paymentStatus: true, customerId: true },
    });
    if (!order || !order.paymentToken) {
      return NextResponse.json({ error: "Lien introuvable." }, { status: 404 });
    }
    if (order.paymentStatus !== "pending") {
      return NextResponse.json(
        { error: "Ce lien a déjà été payé, il ne peut plus être supprimé." },
        { status: 400 }
      );
    }
    // Les articles sont supprimés en cascade. Le client provisoire est
    // conservé seulement s'il a d'autres commandes.
    await prisma.$transaction(async (tx) => {
      await tx.order.delete({ where: { id } });
      const remaining = await tx.order.count({ where: { customerId: order.customerId } });
      if (remaining === 0) {
        await tx.customer.deleteMany({
          where: { id: order.customerId, email: { startsWith: "paiement-lien+" } },
        });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
