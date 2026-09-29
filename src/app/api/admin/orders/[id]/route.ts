import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { isValidOrderStatusKey } from "@/lib/orderStatuses";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await params;
  try {
    const data = await req.json();
    if (data.status !== undefined && data.status !== null) {
      const ok = await isValidOrderStatusKey(String(data.status));
      if (!ok) return NextResponse.json({ error: "Statut inconnu." }, { status: 400 });
    }
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
