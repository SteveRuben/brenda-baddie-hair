import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsappChat from "@/components/WhatsappChat";
import { getSettings } from "@/lib/settings";

/**
 * Habillage de la boutique : header, panier et footer.
 * Le backoffice (/admin) a son propre layout, sans cet habillage.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header siteName={settings.siteName || "bree baddie hair"} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsappChat />
    </>
  );
}
