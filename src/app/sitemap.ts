import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_PAGES = [
  "",
  "/collection",
  "/a-propos",
  "/contact",
  "/livraison",
  "/retours",
  "/mentions-legales",
  "/cgv",
  "/confidentialite",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true },
    });
    for (const p of products) {
      urls.push({
        url: `${SITE_URL}/produit/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // BD indisponible (ex. pendant le build) : sitemap sans les produits.
  }

  return urls;
}
