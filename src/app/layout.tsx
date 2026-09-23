import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsappChat from "@/components/WhatsappChat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brenda Baddie Hair — Perruques premium",
  description:
    "Boutique en ligne de perruques premium : qualité, style et confiance. Paiement sécurisé PayPal, prix en USD et EUR.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <CartProvider>
            <CurrencyProvider>
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsappChat />
            </CurrencyProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
