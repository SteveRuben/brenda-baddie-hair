// Produits de démonstration — utilisés par prisma/seed.ts et par la page
// d'initialisation /admin/setup (premier lancement en production).
// L'administrateur peut ensuite les modifier ou les supprimer depuis le backoffice.

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
  },
];
