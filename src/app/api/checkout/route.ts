import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { auth } from "@/lib/auth";
import { isSameOrigin, rateLimit, rateLimitKey } from "@/lib/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function orderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BBH-${year}-${rand}`;
}

// Le numéro de commande est @unique : en cas de collision (tirage aléatoire),
// on réessaie plutôt que de renvoyer une erreur 500.
async function uniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const n = orderNumber();
    const exists = await prisma.order.findUnique({ where: { number: n }, select: { id: true } });
    if (!exists) return n;
  }
  return `BBH-${Date.now()}`;
}

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json({ error: "Requête invalide." }, { status: 403 });
  if (!rateLimit(rateLimitKey(req, "checkout"), 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  try {
    const { customer, items } = (await req.json()) as {
      customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        notes?: string;
      };
      items: CheckoutItem[];
    };

    if (!customer?.firstName || !customer?.lastName || !customer?.email) {
      return NextResponse.json({ error: "Informations client incomplètes." }, { status: 400 });
    }
    const email = customer.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "Panier vide." }, { status: 400 });
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
        return NextResponse.json(
          { error: `Produit indisponible : ${item.productId}` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
      let priceUSD = product.priceUSD;
      let priceEUR = product.priceEUR;
      let name = product.name;
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          if (variant.priceUSD != null) priceUSD = variant.priceUSD;
          if (variant.priceEUR != null) priceEUR = variant.priceEUR;
          const vLabel = variant.type?.trim() ? `${variant.type.trim()}, ${variant.name}` : variant.name;
          name = `${product.name} — ${vLabel}`;
        }
      }
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}.` },
          { status: 400 }
        );
      }
      subtotalUSD += priceUSD * qty;
      subtotalEUR += priceEUR * qty;
      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        name,
        quantity: qty,
        priceUSD,
        priceEUR,
      });
    }

    const dbCustomer = await (async () => {
      const session = await auth();
      const role = (session?.user as { role?: string } | undefined)?.role;
      const sessionCustomerId = (session?.user as { id?: string } | undefined)?.id;
      const email = customer.email.trim().toLowerCase();
      const profileData = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || null,
        address: customer.address || null,
        city: customer.city || null,
        postalCode: customer.postalCode || null,
        country: customer.country || null,
      };
      if (role === "customer" && sessionCustomerId) {
        // Client connecté : la commande est liée à son compte
        return prisma.customer.update({
          where: { id: sessionCustomerId },
          data: profileData,
        });
      }
      // Invité : on réutilise la fiche existante pour cet email si elle existe.
      // Sécurité : si l'email appartient à un compte inscrit (mot de passe défini),
      // on ne touche PAS à son profil — un invité ne doit pas pouvoir écraser
      // les coordonnées d'un client existant. La commande reste liée à son compte.
      const existingGuest = await prisma.customer.findUnique({
        where: { email },
        select: { id: true, password: true },
      });
      if (existingGuest?.password) {
        return prisma.customer.findUniqueOrThrow({ where: { id: existingGuest.id } });
      }
      return prisma.customer.upsert({
        where: { email },
        update: profileData,
        create: {
          email,
          ...profileData,
        },
      });
    })();

    const shippingUSD = Number(await getSetting("shippingFeeUSD")) || 0;
    const shippingEUR = Number(await getSetting("shippingFeeEUR")) || 0;

    const order = await prisma.order.create({
      data: {
        number: await uniqueOrderNumber(),
        customerId: dbCustomer.id,
        items: { create: orderItems },
        subtotalUSD,
        subtotalEUR,
        shippingUSD,
        shippingEUR,
        totalUSD: subtotalUSD + shippingUSD,
        totalEUR: subtotalEUR + shippingEUR,
        status: "pending",
        paymentStatus: "pending",
        notes: customer.notes || null,
      },
    });

    return NextResponse.json({ orderId: order.id, number: order.number });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
