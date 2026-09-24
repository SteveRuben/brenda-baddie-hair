import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitKey, isSameOrigin } from "@/lib/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Inscription à la newsletter (publique). Idempotent : un email déjà
// inscrit reçoit la même réponse de succès.
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  if (!rateLimit(rateLimitKey(req, "newsletter"), 10, 60_000)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessayez dans une minute." },
      { status: 429 }
    );
  }
  let email: unknown;
  try {
    email = (await req.json()).email;
  } catch {
    email = null;
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim().toLowerCase())) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: {},
      create: { email: normalized },
    });
  } catch {
    return NextResponse.json(
      { error: "Service indisponible, réessayez plus tard." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
