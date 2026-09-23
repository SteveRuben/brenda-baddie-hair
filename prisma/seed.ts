import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Baddie Lisse Premium 22\"",
    slug: "baddie-lisse-premium-22",
    description:
      "Perruque lisse premium en fibres haute qualité, effet naturel et brillance soyeuse. Bonnet ajustable confortable.",
    brand: "Brenda Baddie Hair",
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
    brand: "Brenda Baddie Hair",
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
    brand: "Brenda Baddie Hair",
    color: "Châtain",
    size: '24"',
    priceUSD: 110,
    priceEUR: 99,
    stock: 8,
    status: "active",
    featured: true,
  },
  {
    name: "Bob Chic 12\"",
    slug: "bob-chic-12",
    description:
      "Carré chic et moderne, coupe nette et élégante. Parfait pour un look sophistiqué au quotidien.",
    brand: "Brenda Baddie Hair",
    color: "Noir naturel",
    size: '12"',
    priceUSD: 65,
    priceEUR: 59,
    stock: 20,
    status: "active",
    featured: false,
  },
];

async function main() {
  // Garde-fou : le compte démo (mot de passe connu) ne doit JAMAIS être créé
  // en production. Pour forcer tout de même, définir ALLOW_DEMO_SEED=true.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    console.log("! Seed admin démo ignoré en production (ALLOW_DEMO_SEED non défini).");
  } else {
    const password = await bcrypt.hash("admin123", 10);
    await prisma.user.upsert({
      where: { email: "admin@brendabaddiehair.com" },
      update: {},
      create: {
        email: "admin@brendabaddiehair.com",
        password,
        name: "Brenda",
        role: "admin",
      },
    });
    console.log("✓ Admin créé : admin@brendabaddiehair.com / admin123");
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`✓ ${products.length} produits de démo créés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
