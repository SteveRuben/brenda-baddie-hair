import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { requireMainAdmin, rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// One-shot réservé à l'admin principal : (ré)applique les variantes des
// données de démonstration aux produits démo existants (identifiés par leur
// slug). Idempotent et sans danger : ne touche jamais les produits non-démo,
// ni les images, ni les autres champs des produits.
export async function POST(req: Request) {
  if (!(await requireMainAdmin()).ok) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  if (!rateLimit(rateLimitKey(req, "seed-demo-variants"), 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  }
  try {
    let updated = 0;
    let variants = 0;
    for (const p of DEMO_PRODUCTS) {
      const demoVariants = p.variants ?? [];
      if (demoVariants.length === 0) continue;
      const product = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (!product) continue;
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      await prisma.variant.createMany({
        data: demoVariants.map((v) => ({
          name: v.name,
          type: v.type?.trim() ? v.type.trim() : null,
          priceUSD: v.priceUSD ?? null,
          priceEUR: v.priceEUR ?? null,
          stock: v.stock ?? 0,
          productId: product.id,
        })),
      });
      updated++;
      variants += demoVariants.length;
    }
    return NextResponse.json({ ok: true, updated, variants });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Opération impossible pour le moment." }, { status: 500 });
  }
}
