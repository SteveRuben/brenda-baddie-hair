import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return !!session?.user;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  try {
    const data = await req.json();
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.variant.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        brand: data.brand || null,
        color: data.color || null,
        size: data.size || null,
        priceUSD: Number(data.priceUSD),
        priceEUR: Number(data.priceEUR),
        comparePriceUSD: data.comparePriceUSD != null && data.comparePriceUSD !== "" ? Number(data.comparePriceUSD) : null,
        comparePriceEUR: data.comparePriceEUR != null && data.comparePriceEUR !== "" ? Number(data.comparePriceEUR) : null,
        stock: Number(data.stock ?? 0),
        status: data.status ?? "draft",
        featured: Boolean(data.featured),
        images: {
          create: (data.images ?? []).map((url: string, i: number) => ({ url, position: i })),
        },
        variants: {
          create: (data.variants ?? []).map(
            (v: { name: string; priceUSD: number | null; priceEUR: number | null; stock: number }) => ({
              name: v.name,
              priceUSD: v.priceUSD,
              priceEUR: v.priceEUR,
              stock: Number(v.stock ?? 0),
            })
          ),
        },
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
