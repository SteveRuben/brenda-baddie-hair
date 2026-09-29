import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";
import {
  getOrderStatuses,
  slugifyStatusLabel,
  uniqueStatusKey,
  isValidHexColor,
  PROTECTED_STATUS_KEY,
} from "@/lib/orderStatuses";

export const dynamic = "force-dynamic";

async function checkAuth(req: Request, scope: string) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, scope), 30, 10 * 60_000))
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  return null;
}

// Liste des statuts ordonnés (repli sur les défauts si table vide).
export async function GET() {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const statuses = await getOrderStatuses();
  return NextResponse.json({ statuses, protectedKey: PROTECTED_STATUS_KEY });
}

// Création d'une colonne : { label, color? }
export async function POST(req: Request) {
  const denied = await checkAuth(req, "order-statuses-write");
  if (denied) return denied;
  let body: { label?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const label = (body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "Le libellé est requis." }, { status: 400 });
  if (label.length > 40)
    return NextResponse.json({ error: "Le libellé doit faire 40 caractères maximum." }, { status: 400 });
  const color = (body.color ?? "#64748b").trim();
  if (!isValidHexColor(color))
    return NextResponse.json({ error: "Couleur invalide (format #RRGGBB attendu)." }, { status: 400 });

  const key = await uniqueStatusKey(slugifyStatusLabel(label));
  const max = await prisma.orderStatus.aggregate({ _max: { position: true } });
  const status = await prisma.orderStatus.create({
    data: { key, label, color, position: (max._max.position ?? -1) + 1 },
  });
  return NextResponse.json({ status }, { status: 201 });
}

// Réorganisation : { order: ["pending", "confirmed", ...] } — doit couvrir
// exactement l'ensemble des clés existantes.
export async function PUT(req: Request) {
  const denied = await checkAuth(req, "order-statuses-write");
  if (denied) return denied;
  let body: { order?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!Array.isArray(body.order) || body.order.length === 0)
    return NextResponse.json({ error: "La liste des clés est requise." }, { status: 400 });

  const existing = await prisma.orderStatus.findMany({ select: { key: true } });
  const existingKeys = new Set(existing.map((s) => s.key));
  const givenKeys = new Set(body.order);
  if (givenKeys.size !== body.order.length || ![...givenKeys].every((k) => existingKeys.has(k)) || givenKeys.size !== existingKeys.size)
    return NextResponse.json(
      { error: "La liste doit contenir exactement toutes les colonnes existantes." },
      { status: 400 }
    );

  await prisma.$transaction(
    body.order.map((key, i) =>
      prisma.orderStatus.update({ where: { key }, data: { position: i } })
    )
  );
  const statuses = await getOrderStatuses();
  return NextResponse.json({ statuses });
}
