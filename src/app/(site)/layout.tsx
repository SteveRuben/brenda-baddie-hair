import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsappChat from "@/components/WhatsappChat";

/**
 * Habillage de la boutique : header, panier et footer.
 * Le backoffice (/admin) a son propre layout, sans cet habillage.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsappChat />
    </>
  );
}
