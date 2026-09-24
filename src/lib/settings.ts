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
