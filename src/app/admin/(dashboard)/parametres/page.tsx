import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";
import PaymentMethodsSettings from "@/components/PaymentMethodsSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const baseUrl = process.env.NEXTAUTH_URL || "";
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Paramètres de la boutique</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Textes du site, liens réseaux sociaux et frais de livraison.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <SettingsForm initial={settings} />
      </div>
      <h2 className="mt-8 text-xl font-extrabold">Paiements</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Moyens de paiement proposés aux clients dans le tunnel de commande.
      </p>
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <PaymentMethodsSettings
          webhookUrl={baseUrl ? `${baseUrl}/api/stripe/webhook` : "https://<votre-domaine>/api/stripe/webhook"}
        />
      </div>
    </div>
  );
}
