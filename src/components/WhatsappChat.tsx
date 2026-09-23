import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import WhatsappChatButton from "./WhatsappChatButton";

export default async function WhatsappChat() {
  const settings = await getSettings();
  const number = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const enabled = (settings.whatsappChatEnabled ?? "true") === "true";
  if (!number || !enabled) return null;
  const message =
    settings.whatsappChatMessage || SETTING_DEFAULTS.whatsappChatMessage;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return <WhatsappChatButton href={href} />;
}
