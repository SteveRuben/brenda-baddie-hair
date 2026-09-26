// Produits de démonstration — utilisés par prisma/seed.ts et par la page
// d'initialisation /admin/setup (premier lancement en production).
// L'administrateur peut ensuite les modifier ou les supprimer depuis le backoffice.

export interface DemoVariant {
  /** Taille, ex. "22 pouces" */
  name: string;
  /** Type de produit, ex. "Glueless", "Frontal" (optionnel) */
  type?: string;
  priceUSD?: number | null;
  priceEUR?: number | null;
  stock: number;
}

export interface DemoProduct {
  name: string;
  slug: string;
  description: string;
  brand: string;
  color: string;
  size: string;
  priceUSD: number;
  priceEUR: number;
  stock: number;
  status: string;
  featured: boolean;
  /** Chemins d'images de démonstration (ex. /images/demo/xxx.jpg), dans l'ordre d'affichage. */
  images?: string[];
  /** Variantes type + taille (optionnel). */
  variants?: DemoVariant[];
}

/** Toutes les tailles proposées : 10 à 30 pouces par pas de 2. */
const ALL_LENGTHS = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
const ALL_TYPES = ["Glueless", "Frontal"] as const;

/**
 * Construit les variantes "toutes tailles" d'un produit démo :
 * chaque longueur × Glueless/Frontal. Le prix augmente avec la longueur
 * (stepUSD/stepEUR par tranche de 2 pouces), le Frontal coûte un
 * supplément fixe par rapport au Glueless de même longueur.
 */
function allSizesVariants(
  baseUSD: number,
  baseEUR: number,
  stepUSD = 5,
  stepEUR = 5,
  frontalExtraUSD = 30,
  frontalExtraEUR = 28,
): DemoVariant[] {
  const out: DemoVariant[] = [];
  ALL_TYPES.forEach((type, typeIdx) => {
    ALL_LENGTHS.forEach((len, i) => {
      const extra = type === "Frontal" ? { usd: frontalExtraUSD, eur: frontalExtraEUR } : { usd: 0, eur: 0 };
      out.push({
        name: `${len} pouces`,
        type,
        priceUSD: baseUSD + i * stepUSD + extra.usd,
        priceEUR: baseEUR + i * stepEUR + extra.eur,
        stock: 4 + ((len + typeIdx * 7) % 5) * 2,
      });
    });
  });
  return out;
}

const SIZE_RANGE = '10" - 30"';

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "Baddie Lisse Premium 22\"",
    slug: "baddie-lisse-premium-22",
    description:
      "Perruque lisse premium en fibres haute qualité, effet naturel et brillance soyeuse. Bonnet ajustable confortable.",
    brand: "bree baddie hair",
    color: "Noir naturel",
    size: SIZE_RANGE,
    priceUSD: 89,
    priceEUR: 79,
    stock: 150,
    status: "active",
    featured: true,
    images: [
      "/images/demo/baddie-lisse-1.jpg",
      "/images/demo/baddie-lisse-2.jpg",
      "/images/demo/baddie-lisse-3.jpg",
    ],
    variants: allSizesVariants(69, 62),
  },
  {
    name: "Curly Queen 20\"",
    slug: "curly-queen-20",
    description:
      "Boucles définies et volumineuses pour un look irrésistible. Facile d'entretien, tient toute la journée.",
    brand: "bree baddie hair",
    color: "Noir",
    size: SIZE_RANGE,
    priceUSD: 95,
    priceEUR: 85,
    stock: 150,
    status: "active",
    featured: true,
    images: [
      "/images/demo/curly-queen-1.jpg",
      "/images/demo/curly-queen-2.jpg",
      "/images/demo/curly-queen-3.jpg",
    ],
    variants: allSizesVariants(75, 68),
  },
  {
    name: "Body Wave Luxe 24\"",
    slug: "body-wave-luxe-24",
    description:
      "Ondulations naturelles effet wavy, mouvement fluide et volume maîtrisé. La préférée des baddies.",
    brand: "bree baddie hair",
    color: "Châtain",
    size: SIZE_RANGE,
    priceUSD: 110,
    priceEUR: 99,
    stock: 150,
    status: "active",
    featured: true,
    images: [
      "/images/demo/body-wave-1.jpg",
      "/images/demo/body-wave-2.jpg",
      "/images/demo/body-wave-3.jpg",
    ],
    variants: allSizesVariants(85, 77),
  },
  {
    name: "Bob Chic 12\"",
    slug: "bob-chic-12",
    description:
      "Carré chic et moderne, coupe nette et élégante. Parfait pour un look sophistiqué au quotidien.",
    brand: "bree baddie hair",
    color: "Noir naturel",
    size: SIZE_RANGE,
    priceUSD: 65,
    priceEUR: 59,
    stock: 150,
    status: "active",
    featured: false,
    images: [
      "/images/demo/bob-chic-1.jpg",
      "/images/demo/bob-chic-2.jpg",
      "/images/demo/bob-chic-3.jpg",
    ],
    variants: allSizesVariants(59, 53),
  },
];
