import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing?.password) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email. Connectez-vous." },
        { status: 409 }
      );
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
