import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function orderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BBH-${year}-${rand}`;
}

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { customer, items } = (await req.json()) as {
      customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
      };
      items: CheckoutItem[];
    };

    if (!customer?.firstName || !customer?.lastName || !customer?.email) {
      return NextResponse.json({ error: "Informations client incomplètes." }, { status: 400 });
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
          name = `${product.name} — ${variant.name}`;
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

    const dbCustomer = await prisma.customer.create({
      data: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
      },
    });

    const order = await prisma.order.create({
      data: {
        number: orderNumber(),
        customerId: dbCustomer.id,
        items: { create: orderItems },
        subtotalUSD,
        subtotalEUR,
        totalUSD: subtotalUSD,
        totalEUR: subtotalEUR,
        status: "pending",
        paymentStatus: "pending",
      },
    });

    return NextResponse.json({ orderId: order.id, number: order.number });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
