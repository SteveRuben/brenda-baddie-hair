import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "inscription"), 10, 60_000))
    return NextResponse.json({ error: "Trop de tentatives, réessayez dans une minute." }, { status: 429 });
  try {
    const { firstName, lastName, email, password } = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs." },
        { status: 400 }
      );
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }
    if (password.length > 72) {
      // bcrypt tronque à 72 octets : on refuse plutôt que de hacher partiellement
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au maximum 72 caractères." },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing?.password) {
      // Anti-énumération : on répond comme en cas de succès, sans rien modifier.
      // Un attaquant ne peut pas savoir si l'email est déjà inscrit.
      return NextResponse.json({ ok: true });
    }

    const hash = await bcrypt.hash(password, 10);
    let customer;
    if (existing) {
      // Ligne invitée existante : on y attache le mot de passe
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password: hash,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          password: hash,
        },
      });
    }

    // Rattache les commandes passées en invité avec le même email
    // (sécurité : au cas où des lignes clients en double subsisteraient)
    const duplicates = await prisma.customer.findMany({
      where: { email: normalizedEmail, NOT: { id: customer.id } },
    });
    for (const dup of duplicates) {
      await prisma.order.updateMany({
        where: { customerId: dup.id },
        data: { customerId: customer.id },
      });
      await prisma.customer.delete({ where: { id: dup.id } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
