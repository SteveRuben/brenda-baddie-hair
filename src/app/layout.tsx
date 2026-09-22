import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
        <CartProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
