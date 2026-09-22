import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSettings();
  const whatsapp = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">{settings.siteName}</p>
          <p className="mt-2 text-sm text-brand-200">
            Des perruques premium pour révéler la baddie en vous. Qualité, style et
            confiance.
          </p>
        </div>
        <div>
          <p className="font-bold text-white">Navigation</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/catalogue" className="hover:text-white">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/panier" className="hover:text-white">
                Panier
              </Link>
            </li>
          </ul>
        </div>
        <div id="contact">
          <p className="font-bold text-white">Suivez-nous</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                TikTok
              </a>
            </li>
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} {settings.siteName} — Tous droits réservés.
      </div>
    </footer>
  );
}
