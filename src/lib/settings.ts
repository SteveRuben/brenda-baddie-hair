import { prisma } from "./prisma";

export const SETTING_DEFAULTS: Record<string, string> = {
  siteName: "Brenda Baddie Hair",
  heroTitle: "Révèle la baddie en toi",
  heroSubtitle:
    "Des perruques premium, une qualité irréprochable et un style qui ne passe jamais inaperçu.",
  aboutTitle: "Notre histoire",
  aboutText:
    "Brenda Baddie Hair est née d'une passion : offrir des perruques d'exception qui subliment chaque femme. Chaque modèle est sélectionné avec exigence pour sa qualité, son confort et son style.",
  instagramUrl: "",
  tiktokUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  whatsappNumber: "",
  whatsappChatEnabled: "true",
  whatsappChatMessage: "Bonjour Brenda Baddie Hair, j'ai une question !",
  shippingFeeUSD: "0",
  shippingFeeEUR: "0",
  legalMentions: "",
  cgv: "",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const merged: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const r of rows) merged[r.key] = r.value;
  return merged;
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key] ?? "";
}
