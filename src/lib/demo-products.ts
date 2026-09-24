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

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "Baddie Lisse Premium 22\"",
    slug: "baddie-lisse-premium-22",
    description:
      "Perruque lisse premium en fibres haute qualité, effet naturel et brillance soyeuse. Bonnet ajustable confortable.",
    brand: "bree baddie hair",
    color: "Noir naturel",
    size: '22"',
    priceUSD: 89,
    priceEUR: 79,
    stock: 15,
    status: "active",
    featured: true,
    variants: [
      { name: '18 pouces', type: "Glueless", priceUSD: 79, priceEUR: 71, stock: 8 },
      { name: '22 pouces', type: "Glueless", priceUSD: 89, priceEUR: 79, stock: 15 },
      { name: '24 pouces', type: "Glueless", priceUSD: 99, priceEUR: 89, stock: 6 },
      { name: '18 pouces', type: "Frontal", priceUSD: 109, priceEUR: 99, stock: 5 },
      { name: '22 pouces', type: "Frontal", priceUSD: 119, priceEUR: 109, stock: 7 },
      { name: '24 pouces', type: "Frontal", priceUSD: 129, priceEUR: 119, stock: 4 },
    ],
  },
  {
    name: "Curly Queen 20\"",
    slug: "curly-queen-20",
    description:
      "Boucles définies et volumineuses pour un look irrésistible. Facile d'entretien, tient toute la journée.",
    brand: "bree baddie hair",
    color: "Noir",
    size: '20"',
    priceUSD: 95,
    priceEUR: 85,
    stock: 10,
    status: "active",
    featured: true,
    variants: [
      { name: '16 pouces', type: "Glueless", priceUSD: 85, priceEUR: 77, stock: 6 },
      { name: '20 pouces', type: "Glueless", priceUSD: 95, priceEUR: 85, stock: 10 },
      { name: '24 pouces', type: "Glueless", priceUSD: 105, priceEUR: 95, stock: 5 },
      { name: '16 pouces', type: "Frontal", priceUSD: 115, priceEUR: 105, stock: 4 },
      { name: '20 pouces', type: "Frontal", priceUSD: 125, priceEUR: 115, stock: 6 },
      { name: '24 pouces', type: "Frontal", priceUSD: 135, priceEUR: 125, stock: 3 },
    ],
  },
  {
    name: "Body Wave Luxe 24\"",
    slug: "body-wave-luxe-24",
    description:
      "Ondulations naturelles effet wavy, mouvement fluide et volume maîtrisé. La préférée des baddies.",
    brand: "bree baddie hair",
    color: "Châtain",
    size: '24"',
    priceUSD: 110,
    priceEUR: 99,
    stock: 8,
    status: "active",
    featured: true,
    variants: [
      { name: '20 pouces', type: "Glueless", priceUSD: 100, priceEUR: 90, stock: 5 },
      { name: '24 pouces', type: "Glueless", priceUSD: 110, priceEUR: 99, stock: 8 },
      { name: '26 pouces', type: "Glueless", priceUSD: 120, priceEUR: 109, stock: 4 },
      { name: '20 pouces', type: "Frontal", priceUSD: 130, priceEUR: 119, stock: 4 },
      { name: '24 pouces', type: "Frontal", priceUSD: 140, priceEUR: 129, stock: 6 },
      { name: '26 pouces', type: "Frontal", priceUSD: 150, priceEUR: 139, stock: 3 },
    ],
    images: [
      "/images/demo/body-wave-1.jpg",
      "/images/demo/body-wave-2.jpg",
      "/images/demo/body-wave-3.jpg",
    ],
  },
  {
    name: "Bob Chic 12\"",
    slug: "bob-chic-12",
    description:
      "Carré chic et moderne, coupe nette et élégante. Parfait pour un look sophistiqué au quotidien.",
    brand: "bree baddie hair",
    color: "Noir naturel",
    size: '12"',
    priceUSD: 65,
    priceEUR: 59,
    stock: 20,
    status: "active",
    featured: false,
    variants: [
      { name: '10 pouces', type: "Glueless", priceUSD: 59, priceEUR: 53, stock: 10 },
      { name: '12 pouces', type: "Glueless", priceUSD: 65, priceEUR: 59, stock: 20 },
      { name: '14 pouces', type: "Glueless", priceUSD: 69, priceEUR: 63, stock: 8 },
      { name: '10 pouces', type: "Frontal", priceUSD: 79, priceEUR: 71, stock: 6 },
      { name: '12 pouces', type: "Frontal", priceUSD: 85, priceEUR: 77, stock: 9 },
      { name: '14 pouces', type: "Frontal", priceUSD: 89, priceEUR: 81, stock: 5 },
    ],
  },
];
