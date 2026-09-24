import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Livraison — bree baddie hair",
  description:
    "Informations sur la livraison de vos perruques : délais, suivi et frais.",
};

export const dynamic = "force-dynamic";

export default async function LivraisonPage() {
  const settings = await getSettings();
  const feeUSD = Number(settings.shippingFeeUSD || 0);
  const feeEUR = Number(settings.shippingFeeEUR || 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Informations de livraison</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-neutral-700">
        <h2 className="text-xl font-bold text-neutral-900">Délais</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-neutral-900">Préparation :</strong> 1 à 2
            jours ouvrés après validation de votre commande.
          </li>
          <li>
            <strong className="text-neutral-900">Expédition :</strong> 3 à 7
            jours ouvrés selon votre destination.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">Frais de livraison</h2>
        <p>
          {feeUSD > 0 || feeEUR > 0 ? (
            <>
              Les frais de livraison sont de{" "}
              <strong className="text-neutral-900">
                {feeUSD > 0 ? `${feeUSD.toFixed(2)} $` : ""}
                {feeUSD > 0 && feeEUR > 0 ? " / " : ""}
                {feeEUR > 0 ? `${feeEUR.toFixed(2)} €` : ""}
              </strong>{" "}
              par commande. Ils sont calculés automatiquement au moment du
              paiement.
            </>
          ) : (
            <>
              La <strong className="text-neutral-900">livraison est offerte</strong>{" "}
              sur toutes les commandes.
            </>
          )}
        </p>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">Suivi de commande</h2>
        <p>
          Dès l'expédition de votre colis, vous recevez un{" "}
          <strong className="text-neutral-900">numéro de suivi</strong> par email
          pour suivre votre commande en temps réel. Vous pouvez également
          retrouver le statut de vos commandes à tout moment dans votre{" "}
          <strong className="text-neutral-900">espace client</strong>.
        </p>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">Zones desservies</h2>
        <p>
          Nous livrons partout. En cas de question sur une destination
          particulière, contactez-nous avant de commander : nous vous
          confirmerons le délai et le tarif applicables.
        </p>
      </div>
    </div>
  );
}
