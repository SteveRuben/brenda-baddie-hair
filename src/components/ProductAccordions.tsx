import Link from "next/link";

type Props = {
  description: string;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  stock: number;
};

// Accordéons d'information sur la fiche produit (inspiré de nandiswigs.com :
// Détails du produit / Livraison / Retours). <details> natif : accessible,
// sans JavaScript d'état.
export default function ProductAccordions({ description, brand, color, size, stock }: Props) {
  const items: { title: string; content: React.ReactNode }[] = [
    {
      title: "Détails du produit",
      content: (
        <div className="space-y-1">
          {description && <p className="leading-relaxed">{description}</p>}
          <dl className="pt-2">
            {brand && (
              <div className="flex gap-2">
                <dt className="font-semibold">Marque :</dt>
                <dd>{brand}</dd>
              </div>
            )}
            {color && (
              <div className="flex gap-2">
                <dt className="font-semibold">Couleur :</dt>
                <dd>{color}</dd>
              </div>
            )}
            {size && (
              <div className="flex gap-2">
                <dt className="font-semibold">Taille :</dt>
                <dd>{size}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-semibold">Stock :</dt>
              <dd>{stock > 0 ? `${stock} disponible(s)` : "Rupture de stock"}</dd>
            </div>
          </dl>
        </div>
      ),
    },
    {
      title: "Livraison",
      content: (
        <p className="leading-relaxed">
          Chaque commande est préparée avec soin et expédiée avec suivi. Les
          délais et frais de livraison sont indiqués au moment de la commande.{" "}
          <Link href="/livraison" className="font-semibold text-brand-700 underline">
            En savoir plus
          </Link>
        </p>
      ),
    },
    {
      title: "Retours & échanges",
      content: (
        <p className="leading-relaxed">
          Un article ne vous convient pas ? Vous disposez d'un délai de
          rétractation pour nous le retourner.{" "}
          <Link href="/retours" className="font-semibold text-brand-700 underline">
            Voir les conditions
          </Link>
        </p>
      ),
    },
  ];

  return (
    <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
      {items.map((item) => (
        <details key={item.title} className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-neutral-800 [&::-webkit-details-marker]:hidden">
            {item.title}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 transition group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="pt-3 text-sm text-neutral-600">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
