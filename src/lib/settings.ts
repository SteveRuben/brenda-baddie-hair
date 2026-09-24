import { prisma } from "./prisma";

export const SETTING_DEFAULTS: Record<string, string> = {
  siteName: "bree baddie hair",
  heroTitle: "Révèle la baddie en toi",
  heroSubtitle:
    "Des perruques premium, une qualité irréprochable et un style qui ne passe jamais inaperçu.",
  heroImageUrl: "",
  announcementTitle: "Information",
  announcementText: "",
  aboutTitle: "Notre histoire",
  aboutText:
    "bree baddie hair est née d'une passion : offrir des perruques d'exception qui subliment chaque femme. Chaque modèle est sélectionné avec exigence pour sa qualité, son confort et son style.",
  instagramUrl: "https://www.instagram.com/breebaddiehair",
  tiktokUrl: "https://www.tiktok.com/@bree.baddie.hair",
  facebookUrl: "",
  youtubeUrl: "",
  whatsappNumber: "33659183821",
  whatsappChatEnabled: "true",
  whatsappChatMessage: "Bonjour bree baddie hair, j'ai une question !",
  contactEmail: "",
  shippingFeeUSD: "0",
  shippingFeeEUR: "0",
  legalMentions: "",
  cgv: "",
  privacyPolicy:
    "Dernière mise à jour : septembre 2026.\n\n1. Responsable du traitement\nbree baddie hair est responsable du traitement de vos données personnelles. Pour toute question, contactez-nous via la page Contact.\n\n2. Données collectées\nNous collectons les données que vous nous fournissez : nom, email, adresse de livraison et de facturation lors de la création de votre compte et de vos commandes, ainsi que l'historique de vos achats.\n\n3. Finalités\nVos données servent uniquement à : traiter et livrer vos commandes, gérer votre compte client, vous envoyer les emails liés à vos achats (confirmation, suivi) et répondre à vos demandes.\n\n4. Cookies\nLe site utilise le stockage local de votre navigateur pour le panier (indispensable au fonctionnement de la boutique, exempté de consentement). Avec votre accord, des cookies de mesure d'audience peuvent être déposés. Le paiement via PayPal est soumis à la politique de confidentialité de PayPal.\n\n5. Conservation\nVos données sont conservées le temps nécessaire à la gestion de la relation commerciale et aux obligations légales (facturation).\n\n6. Vos droits\nConformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et de portabilité de vos données, ainsi que d'un droit d'opposition. Pour exercer ces droits, contactez-nous via la page Contact. Vous pouvez également introduire une réclamation auprès de l'autorité de protection des données compétente.",
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const merged: Record<string, string> = { ...SETTING_DEFAULTS };
    for (const r of rows) merged[r.key] = r.value;
    return merged;
  } catch {
    // BD indisponible (ex. pendant le build sans DATABASE_URL) :
    // on rend le site avec les valeurs par défaut plutôt que de planter.
    return { ...SETTING_DEFAULTS };
  }
}

export async function getSetting(key: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? SETTING_DEFAULTS[key] ?? "";
  } catch {
    return SETTING_DEFAULTS[key] ?? "";
  }
}
