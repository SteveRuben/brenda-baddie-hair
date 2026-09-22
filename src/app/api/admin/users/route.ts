import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireMainAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin";
}

export async function GET() {
  if (!(await requireMainAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  if (!(await requireMainAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  try {
    const { email, name, password, role } = (await req.json()) as {
      email: string;
      name?: string;
      password: string;
      role?: string;
    };
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Email et mot de passe (8 caractères min) requis." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: await bcrypt.hash(password, 10),
        role: role === "employe" ? "employe" : "admin",
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireMainAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });
  const session = await auth();
  const selfId = (session?.user as { id?: string } | undefined)?.id;
  if (id === selfId) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
