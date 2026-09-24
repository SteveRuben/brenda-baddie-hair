import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { requireMainAdmin, rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// One-shot réservé à l'admin principal : attache les visuels de démonstration
// aux produits démo qui n'ont encore aucune image (ex. seedés avant l'ajout
// des photos). Idempotent et sans danger : ne touche jamais les images
// existantes ni les produits non-démo.
export async function POST(req: Request) {
  if (!(await requireMainAdmin()).ok) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  if (!rateLimit(rateLimitKey(req, "seed-demo-images"), 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  }
  try {
    let updated = 0;
    for (const p of DEMO_PRODUCTS) {
      const images = p.images ?? [];
      if (images.length === 0) continue;
      const product = await prisma.product.findUnique({
        where: { slug: p.slug },
        include: { images: { take: 1 } },
      });
      if (!product || product.images.length > 0) continue;
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({ url, position: i, productId: product.id })),
      });
      updated++;
    }
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Opération impossible pour le moment." }, { status: 500 });
  }
}
