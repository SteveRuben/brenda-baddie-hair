import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

function customerIdOf(session: Session | null): string | null {
  const role = (session?.user as { role?: string } | undefined)?.role;
  const id = (session?.user as { id?: string } | undefined)?.id;
  return role === "customer" && id ? id : null;
}

export async function GET() {
  const customerId = customerIdOf(await auth());
  if (!customerId) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
    },
  });
  if (!customer) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  return NextResponse.json(customer);
}

export async function PUT(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "profil"), 30, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  const customerId = customerIdOf(await auth());
  if (!customerId) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  const { firstName, lastName, phone, address, city, postalCode, country } =
    (await req.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json(
      { error: "Le prénom et le nom sont obligatoires." },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      postalCode: postalCode?.trim() || null,
      country: country?.trim() || null,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
    },
  });
  return NextResponse.json(customer);
}
