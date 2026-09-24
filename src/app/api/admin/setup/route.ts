import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// L'initialisation n'est possible que si aucun compte staff n'existe.
// Dès le premier admin créé, ces endpoints deviennent inertes.
async function setupNeeded(): Promise<boolean> {
  const count = await prisma.user.count();
  return count === 0;
}

export async function GET() {
  try {
    return NextResponse.json({ needed: await setupNeeded() });
  } catch {
    // BD injoignable : on répond "non" (fail closed, pas d'info utile).
    return NextResponse.json({ needed: false });
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  if (!rateLimit(rateLimitKey(req, "admin-setup"), 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });
  }
  try {
    if (!(await setupNeeded())) {
      return NextResponse.json({ error: "L'administration est déjà configurée." }, { status: 403 });
    }
    const { name, email, password, seedProducts } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      seedProducts?: boolean;
    };
    const cleanEmail = (email ?? "").trim();
    if (!cleanEmail || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email et mot de passe (8 caractères minimum) requis." },
        { status: 400 }
      );
    }
    const hash = await bcrypt.hash(password, 10);
    try {
      await prisma.user.create({
        data: {
          email: cleanEmail,
          name: (name ?? "").trim() || null,
          password: hash,
          role: "admin",
        },
      });
    } catch {
      // Course entre deux créations simultanées : quelqu'un a été plus vite.
      return NextResponse.json({ error: "L'administration est déjà configurée." }, { status: 403 });
    }

    let seeded = 0;
    if (seedProducts && (await prisma.product.count()) === 0) {
      for (const p of DEMO_PRODUCTS) {
        await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
      }
      seeded = DEMO_PRODUCTS.length;
    }
    return NextResponse.json({ ok: true, seeded });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Création impossible pour le moment." }, { status: 500 });
  }
}
