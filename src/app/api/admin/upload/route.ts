import { NextResponse } from "next/server";
import { requireStaff, detectImageType, isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

export async function POST(req: Request) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "upload"), 30, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    if (!files.length) return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} fichiers par envoi.` }, { status: 400 });
    }

    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)." }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      // Le type réel est détecté par magic bytes, pas par le Content-Type
      // ni l'extension fournis par le client (facilement falsifiables).
      // SVG refusé : script embarqué = XSS stocké servi depuis notre domaine.
      const type = detectImageType(buffer);
      if (!type) {
        return NextResponse.json(
          { error: "Format d'image non supporté (JPEG, PNG, WebP ou GIF uniquement)." },
          { status: 400 }
        );
      }
      // Nom de fichier aléatoire + extension imposée par le type détecté :
      // aucune partie du nom d'origine n'est réutilisée (pas de path traversal).
      const name = `${Date.now()}-${randomBytes(8).toString("hex")}.${type}`;
      await writeFile(join(dir, name), buffer);
      urls.push(`/uploads/${name}`);
    }
    return NextResponse.json({ urls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload impossible." }, { status: 500 });
  }
}
