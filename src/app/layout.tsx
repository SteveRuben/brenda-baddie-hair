import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName || "bree baddie hair";
  const title = `${siteName} — Perruques premium`;
  const description =
    "Boutique en ligne de perruques premium : qualité, style et confiance. Paiement sécurisé PayPal, prix en USD et EUR.";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName,
      title,
      description,
      images: [
        {
          url: "/images/og-image.png?v=2",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.png?v=2"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateViewport(): Viewport {
  return {
    themeColor: "#0a0a0a",
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
