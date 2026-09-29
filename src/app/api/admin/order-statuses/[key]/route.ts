import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";
import { isValidHexColor, PROTECTED_STATUS_KEY } from "@/lib/orderStatuses";

export const dynamic = "force-dynamic";

async function checkAuth(req: Request) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "order-statuses-write"), 30, 10 * 60_000))
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  return null;
}

// Renommer / recolorer une colonne : { label?, color? }
export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const denied = await checkAuth(req);
  if (denied) return denied;
  const { key } = await params;
  const existing = await prisma.orderStatus.findUnique({ where: { key } });
  if (!existing) return NextResponse.json({ error: "Statut introuvable." }, { status: 404 });

  let body: { label?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const data: { label?: string; color?: string } = {};
  if (body.label !== undefined) {
    const label = body.label.trim();
    if (!label) return NextResponse.json({ error: "Le libellé est requis." }, { status: 400 });
    if (label.length > 40)
      return NextResponse.json({ error: "Le libellé doit faire 40 caractères maximum." }, { status: 400 });
    data.label = label;
  }
  if (body.color !== undefined) {
    const color = body.color.trim();
    if (!isValidHexColor(color))
      return NextResponse.json({ error: "Couleur invalide (format #RRGGBB attendu)." }, { status: 400 });
    data.color = color;
  }
  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "Rien à modifier." }, { status: 400 });

  const status = await prisma.orderStatus.update({ where: { key }, data });
  return NextResponse.json({ status });
}

// Supprimer une colonne — refusée si des commandes l'utilisent ou si c'est
// le statut protégé "pending" (statut de création des commandes).
export async function DELETE(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const denied = await checkAuth(req);
  if (denied) return denied;
  const { key } = await params;
  if (key === PROTECTED_STATUS_KEY)
    return NextResponse.json(
      { error: "Ce statut est utilisé à la création des commandes, il ne peut pas être supprimé." },
      { status: 400 }
    );
  const existing = await prisma.orderStatus.findUnique({ where: { key } });
  if (!existing) return NextResponse.json({ error: "Statut introuvable." }, { status: 404 });

  const used = await prisma.order.count({ where: { status: key } });
  if (used > 0)
    return NextResponse.json(
      { error: `Impossible : ${used} commande(s) utilisent encore ce statut. Déplacez-les d'abord.` },
      { status: 400 }
    );

  await prisma.orderStatus.delete({ where: { key } });
  // Renormalise les positions restantes.
  const rest = await prisma.orderStatus.findMany({ orderBy: { position: "asc" } });
  await prisma.$transaction(
    rest.map((s, i) => prisma.orderStatus.update({ where: { id: s.id }, data: { position: i } }))
  );
  return NextResponse.json({ ok: true });
}
