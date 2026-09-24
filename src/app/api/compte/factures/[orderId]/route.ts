import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

function eur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function dateFR(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const customerId = (session?.user as { id?: string } | undefined)?.id;

  if (role !== "customer" || !customerId) {
    return NextResponse.json({ error: "Accès réservé aux clients connectés." }, { status: 403 });
  }
  // La génération PDF est coûteuse : on la rate-limite (anti-DoS).
  if (!rateLimit(`rl:facture:${customerId}`, 20, 60_000))
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true },
  });

  if (!order || order.customerId !== customerId) {
    return NextResponse.json({ error: "Facture introuvable." }, { status: 403 });
  }

  const settings = await getSettings();
  const siteName = settings.siteName || "bree baddie hair";

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  const primary: [number, number, number] = [190, 24, 93]; // rouge brand

  // En-tête boutique
  doc.fillColor(primary).fontSize(22).font("Helvetica-Bold").text(siteName);
  doc.fillColor("#333").fontSize(10).font("Helvetica");
  if (settings.legalMentions) doc.text(settings.legalMentions, { width: 500 });
  doc.moveDown(0.5);
  doc.fillColor(primary).fontSize(16).font("Helvetica-Bold").text("Facture");
  doc.fillColor("#333").fontSize(11).font("Helvetica");
  doc.text(`N° de commande : ${order.number}`);
  doc.text(`Date : ${dateFR(new Date(order.createdAt))}`);
  doc.moveDown();

  // Infos client
  doc.fontSize(12).font("Helvetica-Bold").text("Facturé à :");
  doc.fontSize(10).font("Helvetica");
  const c = order.customer;
  doc.text(`${c.firstName} ${c.lastName}`);
  doc.text(c.email);
  if (c.phone) doc.text(c.phone);
  if (c.address) doc.text(c.address);
  const cityLine = [c.postalCode, c.city].filter(Boolean).join(" ");
  if (cityLine) doc.text(cityLine);
  if (c.country) doc.text(c.country);
  doc.moveDown();

  // Lignes d'articles
  doc.fontSize(12).font("Helvetica-Bold").text("Articles");
  doc.moveDown(0.3);
  const colX = [50, 330, 420];
  doc.fontSize(10);
  doc.text("Article", colX[0], doc.y, { width: 270 });
  doc.text("Qté", colX[1], doc.y - 12, { width: 60 });
  doc.text("Total", colX[2], doc.y - 12, { width: 130 });
  doc.moveDown(0.2);
  doc.strokeColor("#ddd").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.4);

  for (const item of order.items) {
    const y = doc.y;
    doc.fillColor("#111").font("Helvetica").fontSize(10);
    doc.text(item.name, colX[0], y, { width: 270 });
    doc.text(String(item.quantity), colX[1], y, { width: 60 });
    doc.text(`${usd(item.priceUSD * item.quantity)} / ${eur(item.priceEUR * item.quantity)}`, colX[2], y, {
      width: 130,
    });
    doc.moveDown(0.8);
  }

  doc.strokeColor("#ddd").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Totaux
  doc.fontSize(11);
  const total = (label: string, value: string, bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica");
    doc.text(label, 330, doc.y, { width: 120 });
    doc.text(value, 450, doc.y - 13.2, { width: 95, align: "right" });
    doc.moveDown(0.4);
  };
  total("Sous-total", `${usd(order.subtotalUSD)} / ${eur(order.subtotalEUR)}`);
  total("Livraison", `${usd(order.shippingUSD)} / ${eur(order.shippingEUR)}`);
  doc.fillColor(primary);
  total("Total", `${usd(order.totalUSD)} / ${eur(order.totalEUR)}`, true);
  doc.fillColor("#333");

  doc.moveDown(1.5);
  doc.fontSize(9).font("Helvetica-Oblique").fillColor("#777");
  doc.text("Merci pour votre confiance.", { align: "center" });

  doc.end();
  const pdf = await done;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${order.number}.pdf"`,
    },
  });
}
