import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { SETTING_DEFAULTS } from "@/lib/settings";

export async function GET() {
  if (!(await requireStaff()).ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const rows = await prisma.setting.findMany();
  const merged: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const r of rows) merged[r.key] = r.value;
  return NextResponse.json(merged);
}

export async function PUT(req: Request) {
  if (!(await requireStaff()).ok) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  try {
    const data = (await req.json()) as Record<string, string>;
    const entries = Object.entries(data).filter(
      ([k, v]) => k in SETTING_DEFAULTS && typeof v === "string"
    );
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
