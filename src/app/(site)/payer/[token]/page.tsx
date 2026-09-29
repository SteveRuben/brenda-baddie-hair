import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import { getSetting } from "@/lib/settings";
import PayerClient from "@/components/PayerClient";

export const dynamic = "force-dynamic";

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-3 text-sm text-neutral-600">{text}</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-ink-950 px-6 py-3 text-sm font-bold text-white hover:bg-ink-800"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}

export default async function PayerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Anti-abus sur la page publique (les API mutantes sont limitées séparément).
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : "unknown";
  if (!rateLimit(`rl:payer-page:${ip}`, 60, 60_000)) {
    return (
      <Notice
        title="Trop de tentatives"
        text="Veuillez patienter une minute avant de réessayer."
      />
    );
  }

  const order = await prisma.order.findUnique({
    where: { paymentToken: token },
    include: { items: true, customer: true },
  });

  if (!order || order.paymentStatus === "failed" || order.paymentStatus === "refunded" || order.status === "cancelled") {
    return (
      <Notice
        title="Lien invalide"
        text="Ce lien de paiement n'existe pas ou n'est plus valable. Contactez la boutique pour en recevoir un nouveau."
      />
    );
  }
  if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) {
    return (
      <Notice
        title="Lien expiré"
        text="Ce lien de paiement a expiré. Contactez la boutique pour en recevoir un nouveau."
      />
    );
  }
  if (order.paymentStatus === "paid") {
    return (
      <Notice
        title="Lien déjà utilisé"
        text={`La commande ${order.number} liée à ce paiement a déjà été réglée. Merci !`}
      />
    );
  }

  const siteName = (await getSetting("siteName")) || "bree baddie hair";
  const isPlaceholder = order.customer.email.startsWith("paiement-lien+");
  // Le nom saisi par Brenda au backoffice pré-remplit le formulaire ;
  // "lien de paiement" (valeur par défaut) n'est pas affiché.
  const lastName =
    isPlaceholder && order.customer.lastName === "lien de paiement"
      ? ""
      : order.customer.lastName;

  return (
    <PayerClient
      token={token}
      siteName={siteName}
      order={{
        id: order.id,
        number: order.number,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceUSD: i.priceUSD,
          priceEUR: i.priceEUR,
        })),
        totalUSD: order.totalUSD,
        totalEUR: order.totalEUR,
      }}
      customer={{
        firstName: order.customer.firstName === "Client" && isPlaceholder ? "" : order.customer.firstName,
        lastName,
        email: isPlaceholder ? "" : order.customer.email,
        phone: order.customer.phone ?? "",
      }}
    />
  );
}
