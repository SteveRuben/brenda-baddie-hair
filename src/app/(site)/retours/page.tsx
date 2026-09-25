import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Retours & échanges — bree baddie hair",
  description:
    "Notre politique de retours et d'échanges : délai de 14 jours, conditions et remboursement.",
};

export default function RetoursPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Retours & échanges</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-neutral-700">
        <p>
          Votre satisfaction est notre priorité. Si votre perruque ne vous
          convient pas, vous disposez d'un délai de{" "}
          <strong className="text-neutral-900">14 jours</strong> après réception
          pour demander un retour ou un échange.
        </p>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">
          Conditions de retour
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            La perruque doit être <strong className="text-neutral-900">non portée,
            non lavée et non coupée</strong>, dans son emballage d'origine.
          </li>
          <li>
            Pour des raisons d'hygiène, tout article présentant des traces de
            port, d'odeur ou de produit coiffant ne pourra pas être repris.
          </li>
          <li>
            Les frais de retour sont à la charge de la cliente, sauf erreur de
            notre part (mauvais modèle, article défectueux).
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">
          Comment demander un retour
        </h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Contactez-nous via{" "}
            <Link href="/contact" className="font-semibold text-ink-950 hover:underline">
              la page contact
            </Link>{" "}
            en indiquant votre numéro de commande.
          </li>
          <li>
            Notre équipe valide votre demande et vous transmet les instructions
            d'envoi.
          </li>
          <li>
            Dès réception et contrôle de l'article, nous procédons au{" "}
            <strong className="text-neutral-900">remboursement</strong> sur votre
            moyen de paiement d'origine, ou à l'
            <strong className="text-neutral-900">échange</strong> selon votre
            choix.
          </li>
        </ol>
        <p>
          Les remboursements sont traités sous 5 à 10 jours ouvrés après
          réception de l'article retourné.
        </p>
      </div>
    </div>
  );
}
