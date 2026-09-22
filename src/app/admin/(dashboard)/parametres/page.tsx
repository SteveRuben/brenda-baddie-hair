import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Paramètres de la boutique</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Textes du site, liens réseaux sociaux et frais de livraison.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
