import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, isSameOrigin } from "@/lib/security";

// Suppression d'un abonné (staff uniquement)
export async function DELETE(req: Request) {
  const { ok } = await requireStaff();
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });
  await prisma.newsletterSubscriber.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
