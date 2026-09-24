import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsappChat from "@/components/WhatsappChat";
import CookieConsent from "@/components/CookieConsent";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

/**
 * Habillage de la boutique : header, panier et footer.
 * Le backoffice (/admin) a son propre layout, sans cet habillage.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category
      .findMany({
        include: { _count: { select: { products: { where: { status: "active" } } } } },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);
  const menuCategories = categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({ name: c.name, slug: c.slug }));
  return (
    <>
      <Header siteName={settings.siteName || "bree baddie hair"} categories={menuCategories} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsappChat />
      <CookieConsent />
    </>
  );
}
