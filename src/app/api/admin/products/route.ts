import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return !!session?.user;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const data = await req.json();
    if (!data.name || data.priceUSD == null || data.priceEUR == null) {
      return NextResponse.json({ error: "Nom et prix (USD + EUR) requis." }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        brand: data.brand || null,
        color: data.color || null,
        size: data.size || null,
        priceUSD: Number(data.priceUSD),
        priceEUR: Number(data.priceEUR),
        comparePriceUSD: data.comparePriceUSD != null ? Number(data.comparePriceUSD) : null,
        comparePriceEUR: data.comparePriceEUR != null ? Number(data.comparePriceEUR) : null,
        stock: Number(data.stock ?? 0),
        status: data.status ?? "draft",
        featured: Boolean(data.featured),
        images: {
          create: (data.images ?? []).map((url: string, i: number) => ({ url, position: i })),
        },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Création impossible (slug déjà utilisé ?)." }, { status: 500 });
  }
}
