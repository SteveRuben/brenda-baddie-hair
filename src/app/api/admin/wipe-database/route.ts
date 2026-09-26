import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { applyDemoProduct } from "@/lib/demo-seed";
import { requireMainAdmin, rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// DANGER — Vidage complet de la base de données, réservé à l'admin principal.
// Supprime TOUTES les données (utilisateurs, produits, variantes, images,
// commandes, clients, abonnés newsletter, paramètres) puis recharge les
// 4 produits de démonstration "toutes tailles".
// Exige une confirmation explicite dans le corps ({ confirm: "VIDER" }),
// la même origine, et un rate limit très strict. Après l'opération, le
// compte admin n'existe plus : il faut en recréer un via /admin/setup.
export async function POST(req: Request) {
  if (!(await requireMainAdmin()).ok) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  if (!rateLimit(rateLimitKey(req, "wipe-database"), 3, 60 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  }
  let body: { confirm?: string } = {};
  try {
    body = (await req.json()) as { confirm?: string };
  } catch {
    body = {};
  }
  if (body.confirm !== "VIDER") {
    return NextResponse.json({ error: "Confirmation manquante." }, { status: 400 });
  }
  try {
    // CASCADE : l'ordre n'a pas d'importance, les clés étrangères suivent.
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Category", "NewsletterSubscriber", "Product", "ProductImage", "Variant", "Customer", "Order", "OrderItem", "Setting" RESTART IDENTITY CASCADE',
    );
    for (const p of DEMO_PRODUCTS) {
      await applyDemoProduct(p);
    }
    return NextResponse.json({ ok: true, wiped: true, products: DEMO_PRODUCTS.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Opération impossible pour le moment." }, { status: 500 });
  }
}
