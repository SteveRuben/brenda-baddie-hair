import nodemailer from "nodemailer";

interface OrderMailItem {
  name: string;
  quantity: number;
  priceUSD: number;
  priceEUR: number;
}

interface OrderMailData {
  number: string;
  firstName: string;
  lastName: string;
  email: string;
  items: OrderMailItem[];
  subtotalUSD: number;
  subtotalEUR: number;
  shippingUSD: number;
  shippingEUR: number;
  totalUSD: number;
  totalEUR: number;
  siteName: string;
}

function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOrderConfirmation(order: OrderMailData): Promise<boolean> {
  if (!mailConfigured()) {
    console.log(`[mail] SMTP non configuré — email de confirmation ${order.number} ignoré.`);
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const from = process.env.MAIL_FROM ?? process.env.SMTP_USER!;
    const lines = order.items
      .map((i) => `• ${i.name} × ${i.quantity} — $${i.priceUSD.toFixed(2)} / ${i.priceEUR.toFixed(2)} €`)
      .join("\n");

    const text = `Bonjour ${order.firstName},

Merci pour votre commande ${order.number} sur ${order.siteName} !

Récapitulatif :
${lines}

Sous-total : $${order.subtotalUSD.toFixed(2)} / ${order.subtotalEUR.toFixed(2)} €
Livraison : $${order.shippingUSD.toFixed(2)} / ${order.shippingEUR.toFixed(2)} €
Total payé : $${order.totalUSD.toFixed(2)} / ${order.totalEUR.toFixed(2)} €

Nous vous préviendrons dès l'expédition de votre colis.

— L'équipe ${order.siteName}`;

    await transporter.sendMail({
      from,
      to: order.email,
      subject: `Confirmation de commande ${order.number} — ${order.siteName}`,
      text,
    });
    return true;
  } catch (e) {
    console.error("[mail] Envoi impossible :", e);
    return false;
  }
}
