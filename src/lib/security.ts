import { auth } from "./auth";

// ---------------------------------------------------------------------------
// Autorisation : rôles staff (admin + employé). La gestion des utilisateurs
// reste réservée à l'admin principal.
// ---------------------------------------------------------------------------
export async function requireStaff() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const ok = role === "admin" || role === "employe";
  return { ok, session, role };
}

export async function requireMainAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return { ok: role === "admin", session, role };
}

// ---------------------------------------------------------------------------
// Rate limiting en mémoire (par instance). Suffisant pour un déploiement
// mono-instance ; en multi-instance, passer par Redis/Upstash.
// ---------------------------------------------------------------------------
const buckets = new Map<string, { count: number; reset: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Nettoyage paresseux des buckets expirés (évite la fuite mémoire)
  if (Math.random() < 0.01) {
    for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function rateLimitKey(req: Request, scope: string): string {
  return `rl:${scope}:${clientIp(req)}`;
}

// ---------------------------------------------------------------------------
// CSRF : n'accepte les requêtes mutantes que depuis le même site.
// Les navigateurs envoient toujours Origin (ou Referer) sur les POST.
// ---------------------------------------------------------------------------
export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "http";
  const expected = `${proto}://${host}`.toLowerCase();
  const origin = req.headers.get("origin");
  if (origin) return origin.toLowerCase() === expected;
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin.toLowerCase() === expected;
    } catch {
      return false;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Upload : détection du type réel d'image par magic bytes (le Content-Type
// et l'extension fournis par le client ne sont pas fiables). SVG refusé
// (XSS stocké), seuls les formats raster sont acceptés.
// ---------------------------------------------------------------------------
export type SafeImageType = "jpg" | "png" | "webp" | "gif";

export function detectImageType(buf: Uint8Array): SafeImageType | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  )
    return "png";
  if (buf.length > 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return "gif";
  if (
    buf.length > 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 // WEBP
  )
    return "webp";
  return null;
}

// ---------------------------------------------------------------------------
// CSV : neutralise l'injection de formules (cellules commençant par = + - @)
// ---------------------------------------------------------------------------
export function csvSafe(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
