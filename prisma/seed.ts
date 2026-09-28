import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_PRODUCTS } from "../src/lib/demo-products";
import { applyDemoProduct } from "../src/lib/demo-seed";

const prisma = new PrismaClient();

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

    // Deuxième compte de test (role "admin") — utile pour tester la gestion
    // multi-comptes (page /admin/utilisateurs) sans passer par le compte
    // principal.
    const testAdminPassword = await bcrypt.hash("test1234", 10);
    await prisma.user.upsert({
      where: { email: "test-admin@brendabaddiehair.com" },
      update: {},
      create: {
        email: "test-admin@brendabaddiehair.com",
        password: testAdminPassword,
        name: "Test Admin",
        role: "admin",
      },
    });
    console.log("✓ Admin de test créé : test-admin@brendabaddiehair.com / test1234");

    // Compte employé de test — pour vérifier que le rôle "employe" a bien
    // accès au backoffice (produits/commandes) mais pas à /admin/utilisateurs,
    // et qu'un client ("customer") n'y a jamais accès (voir src/proxy.ts).
    const testEmployePassword = await bcrypt.hash("test1234", 10);
    await prisma.user.upsert({
      where: { email: "test-employe@brendabaddiehair.com" },
      update: {},
      create: {
        email: "test-employe@brendabaddiehair.com",
        password: testEmployePassword,
        name: "Test Employé",
        role: "employe",
      },
    });
    console.log("✓ Employé de test créé : test-employe@brendabaddiehair.com / test1234");
  }

  for (const p of DEMO_PRODUCTS) {
    await applyDemoProduct(p);
  }
  console.log(`✓ ${DEMO_PRODUCTS.length} produits de démo créés / mis à jour (variantes incluses)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
