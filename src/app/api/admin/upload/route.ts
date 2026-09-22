import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });

    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Fichier trop volumineux (max 5 Mo) : ${file.name}` }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `Format non supporté : ${file.name}` }, { status: 400 });
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(dir, name), buffer);
      urls.push(`/uploads/${name}`);
    }
    return NextResponse.json({ urls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload impossible." }, { status: 500 });
  }
}
