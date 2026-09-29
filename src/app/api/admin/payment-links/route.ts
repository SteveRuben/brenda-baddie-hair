import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireStaff, isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";

function orderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BBH-${year}-${rand}`;
}

// Le numéro de commande est @unique : en cas de collision, on réessaie.
async function uniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const n = orderNumber();
    const exists = await prisma.order.findUnique({
      where: { number: n },
      select: { id: true },
    });
    if (!exists) return n;
  }
  return `BBH-${Date.now()}`;
}

/** Liste des liens de paiement (commandes avec jeton), plus récents d'abord. */
export async function GET() {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const links = await prisma.order.findMany({
    where: { paymentToken: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { items: true, customer: true },
  });
  return NextResponse.json(
    links.map((o) => ({
      id: o.id,
      number: o.number,
      token: o.paymentToken,
      customerName: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      totalUSD: o.totalUSD,
      totalEUR: o.totalEUR,
      paymentStatus: o.paymentStatus,
      expired: o.tokenExpiresAt != null && o.tokenExpiresAt < new Date(),
      createdAt: o.createdAt,
      tokenExpiresAt: o.tokenExpiresAt,
    }))
  );
}

interface LinkItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Crée un lien de paiement : une commande "pending" avec un jeton unique,
 * à envoyer au client (ex. via WhatsApp). Le stock est validé à la création
 * (comme au checkout) mais décrémenté seulement au paiement effectif.
 */
export async function POST(req: Request) {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "payment-link-create"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  try {
    const { customerName, note, expiresInDays, items } = (await req.json()) as {
      customerName?: string;
      note?: string;
      expiresInDays?: number;
      items: LinkItem[];
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Ajoutez au moins un article." }, { status: 400 });
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "active" },
      include: { variants: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotalUSD = 0;
    let subtotalEUR = 0;
    const orderItems = [];

    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Un produit est indisponible." }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
      let priceUSD = product.priceUSD;
      let priceEUR = product.priceEUR;
      let name = product.name;
      let stock = product.stock;
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json({ error: `Variante introuvable pour ${product.name}.` }, { status: 400 });
        }
        if (variant.priceUSD != null) priceUSD = variant.priceUSD;
        if (variant.priceEUR != null) priceEUR = variant.priceEUR;
        const vLabel = variant.type?.trim() ? `${variant.type.trim()}, ${variant.name}` : variant.name;
        name = `${product.name} — ${vLabel}`;
        stock = variant.stock;
      }
      if (stock < qty) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${name}.` },
          { status: 400 }
        );
      }
      subtotalUSD += priceUSD * qty;
      subtotalEUR += priceEUR * qty;
      orderItems.push({
        productId: product.id,
        variantId: item.variantId ?? null,
        name,
        quantity: qty,
        priceUSD,
        priceEUR,
      });
    }

    // Client provisoire : la vraie identité (nom, email) est saisie par le
    // client lui-même sur la page de paiement. L'email fictif est unique et
    // ne reçoit jamais d'email (remplacé avant tout envoi).
    const token = randomBytes(24).toString("base64url");
    const nameParts = (customerName ?? "").trim().split(/\s+/).filter(Boolean);
    const placeholderEmail = `paiement-lien+${token.slice(0, 12)}@breebaddiehair.com`;
    const dbCustomer = await prisma.customer.create({
      data: {
        firstName: nameParts[0] ?? "Client",
        lastName: nameParts.slice(1).join(" ") || "lien de paiement",
        email: placeholderEmail,
      },
    });

    const days = Math.max(1, Math.min(90, Math.floor(expiresInDays ?? 7)));
    const order = await prisma.order.create({
      data: {
        number: await uniqueOrderNumber(),
        customerId: dbCustomer.id,
        items: { create: orderItems },
        subtotalUSD,
        subtotalEUR,
        shippingUSD: 0,
        shippingEUR: 0,
        totalUSD: subtotalUSD,
        totalEUR: subtotalEUR,
        status: "pending",
        paymentStatus: "pending",
        paymentToken: token,
        tokenExpiresAt: new Date(Date.now() + days * 24 * 3600 * 1000),
        notes: note?.trim() ? `[Lien de paiement] ${note.trim()}` : "[Lien de paiement]",
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "";
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      number: order.number,
      token,
      url: baseUrl ? `${baseUrl}/payer/${token}` : `/payer/${token}`,
      expiresAt: order.tokenExpiresAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Création du lien impossible." }, { status: 500 });
  }
}
