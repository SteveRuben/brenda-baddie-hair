import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await params;
  try {
    const data = await req.json();
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        carrier: data.carrier || null,
        trackingNumber: data.trackingNumber || null,
      },
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
