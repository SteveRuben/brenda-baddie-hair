import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — bree baddie hair",
  description:
    "Découvrez l'histoire et la mission de bree baddie hair : des perruques premium qui subliment chaque femme.",
};

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">À propos de nous</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-neutral-700">
        <p>
          <strong className="text-neutral-900">bree baddie hair</strong> est née
          d'une conviction simple : chaque femme mérite de se sentir belle,
          confiante et irrésistible, tous les jours. Nous avons fait de cette
          conviction notre mission en sélectionnant des perruques d'exception,
          pensées pour sublimer toutes les beautés.
        </p>
        <p>
          Chaque modèle de notre catalogue est choisi avec exigence : qualité des
          cheveux, finition de la lace, confort de port et rendu naturel. Nous
          testons nos produits avant de vous les proposer, parce que votre
          satisfaction est notre meilleure publicité.
        </p>
        <h2 className="pt-2 text-xl font-bold text-neutral-900">Nos engagements</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-neutral-900">Qualité premium :</strong> des
            cheveux sélectionnés pour leur douceur, leur tenue et leur aspect
            naturel.
          </li>
          <li>
            <strong className="text-neutral-900">Transparence :</strong> des
            descriptions honnêtes, des photos fidèles et des prix affichés en USD
            et en EUR, sans frais cachés.
          </li>
          <li>
            <strong className="text-neutral-900">Service client attentionné :</strong>
            une équipe disponible pour vous conseiller avant, pendant et après
            votre achat.
          </li>
          <li>
            <strong className="text-neutral-900">Paiement sécurisé :</strong> vos
            transactions sont protégées via PayPal.
          </li>
        </ul>
        <p>
          Merci de votre confiance. Bienvenue dans la famille{" "}
          <strong className="text-neutral-900">bree baddie hair</strong> — révélez
          la baddie en vous.
        </p>
      </div>
    </div>
  );
}
