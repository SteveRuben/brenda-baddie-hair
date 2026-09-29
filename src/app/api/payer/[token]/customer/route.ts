import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER_PREFIX = "paiement-lien+";

/**
 * Le client qui ouvre un lien de paiement saisit son identité avant de
 * payer. On remplace alors le client provisoire créé avec le lien :
 * - si l'email appartient déjà à un compte inscrit, la commande est
 *   rattachée à ce compte sans toucher à son profil (sécurité) ;
 * - si l'email appartient à une fiche invitée, on la met à jour ;
 * - sinon on complète la fiche provisoire du lien.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "payer-customer"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  const { token } = await params;
  try {
    const { firstName, lastName, email, phone } = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
    const cleanEmail = (email ?? "").trim().toLowerCase();
    if (!firstName?.trim() || !lastName?.trim() || !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Prénom, nom et email valide requis." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { paymentToken: token },
      include: { customer: true },
    });
    if (!order) return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
    if (order.paymentStatus !== "pending")
      return NextResponse.json({ error: "Ce lien a déjà été utilisé." }, { status: 400 });
    if (order.tokenExpiresAt && order.tokenExpiresAt < new Date())
      return NextResponse.json({ error: "Ce lien a expiré." }, { status: 400 });

    const profileData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
    };

    const existing = await prisma.customer.findUnique({ where: { email: cleanEmail } });
    let customerId: string;
    if (existing && existing.id !== order.customerId) {
      if (existing.password) {
        // Compte inscrit : on rattache la commande sans écraser son profil.
        customerId = existing.id;
      } else {
        // Fiche invitée existante : on la complète.
        await prisma.customer.update({
          where: { id: existing.id },
          data: { ...profileData, email: cleanEmail },
        });
        customerId = existing.id;
      }
    } else if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: { ...profileData, email: cleanEmail },
      });
      customerId = existing.id;
    } else if (order.customer.email.startsWith(PLACEHOLDER_PREFIX)) {
      // Fiche provisoire du lien : on la remplace par la vraie identité.
      await prisma.customer.update({
        where: { id: order.customerId },
        data: { ...profileData, email: cleanEmail },
      });
      customerId = order.customerId;
    } else {
      // Cas défensif : la fiche liée n'est pas provisoire et l'email est
      // nouveau — on crée une fiche invitée.
      const created = await prisma.customer.create({
        data: { ...profileData, email: cleanEmail },
      });
      customerId = created.id;
    }

    if (customerId !== order.customerId) {
      await prisma.order.update({ where: { id: order.id }, data: { customerId } });
    }

    return NextResponse.json({ ok: true, orderId: order.id, number: order.number });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
