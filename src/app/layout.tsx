import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import { getSettings } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName || "bree baddie hair";
  return {
    title: `${siteName} — Perruques premium`,
    description:
      "Boutique en ligne de perruques premium : qualité, style et confiance. Paiement sécurisé PayPal, prix en USD et EUR.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <CartProvider>
            <CurrencyProvider>{children}</CurrencyProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
