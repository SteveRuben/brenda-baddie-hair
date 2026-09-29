import { prisma } from "@/lib/prisma";
import PaymentLinkCreator, {
  type CreatorProduct,
} from "@/components/admin/PaymentLinkCreator";
import PaymentLinkList, { type LinkRow } from "@/components/admin/PaymentLinkList";

export const dynamic = "force-dynamic";

export default async function PaymentLinksPage() {
  const [products, links] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        priceUSD: true,
        priceEUR: true,
        stock: true,
        variants: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            type: true,
            priceUSD: true,
            priceEUR: true,
            stock: true,
          },
        },
      },
    }),
    prisma.order.findMany({
      where: { paymentToken: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { items: true, customer: true },
    }),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL ?? "";

  const rows: LinkRow[] = links.map((o) => ({
    id: o.id,
    number: o.number,
    token: o.paymentToken as string,
    customerName: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
    items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })),
    totalUSD: o.totalUSD,
    totalEUR: o.totalEUR,
    paymentStatus: o.paymentStatus,
    expired: o.tokenExpiresAt != null && o.tokenExpiresAt < new Date(),
    createdAt: o.createdAt.toISOString(),
    tokenExpiresAt: o.tokenExpiresAt ? o.tokenExpiresAt.toISOString() : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Liens de paiement</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez un lien à envoyer à la cliente (ex. via WhatsApp). Elle paie en ligne, la commande
        est finalisée automatiquement : stock décrémenté, email envoyé.
      </p>

      <div className="mt-6">
        <PaymentLinkCreator products={products as CreatorProduct[]} />
      </div>

      <h2 className="mt-8 font-bold">Liens créés</h2>
      <div className="mt-3">
        <PaymentLinkList initial={rows} baseUrl={baseUrl} />
      </div>
    </div>
  );
}
