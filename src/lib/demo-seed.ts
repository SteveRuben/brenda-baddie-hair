import { prisma } from "./prisma";
import { DEMO_PRODUCTS, type DemoProduct } from "./demo-products";

/**
 * Applique un produit démo en base : crée ou met à jour le produit
 * (identifié par son slug), puis remplace ses images et ses variantes
 * par celles des données démo. Idempotent.
 */
export async function applyDemoProduct(p: DemoProduct) {
  const { images = [], variants = [], ...data } = p;
  const product = await prisma.product.upsert({
    where: { slug: p.slug },
    update: { ...data },
    create: data,
  });
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((url, i) => ({ url, position: i, productId: product.id })),
    });
  }
  await prisma.variant.deleteMany({ where: { productId: product.id } });
  if (variants.length > 0) {
    await prisma.variant.createMany({
      data: variants.map((v) => ({
        name: v.name,
        type: v.type?.trim() ? v.type.trim() : null,
        priceUSD: v.priceUSD ?? null,
        priceEUR: v.priceEUR ?? null,
        stock: v.stock ?? 0,
        productId: product.id,
      })),
    });
  }
  return product;
}

/** Les slugs des produits de démonstration (pour ne jamais toucher aux vrais produits). */
export const DEMO_SLUGS = new Set(DEMO_PRODUCTS.map((p) => p.slug));
