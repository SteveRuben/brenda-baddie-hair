import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  InstagramIcon,
  TiktokIcon,
  FacebookIcon,
  YoutubeIcon,
  WhatsappIcon,
} from "./SocialIcons";

export default async function Footer() {
  const settings = await getSettings();
  const whatsapp = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const socials = [
    { label: "Instagram", href: settings.instagramUrl, Icon: InstagramIcon },
    { label: "TikTok", href: settings.tiktokUrl, Icon: TiktokIcon },
    { label: "Facebook", href: settings.facebookUrl, Icon: FacebookIcon },
    { label: "YouTube", href: settings.youtubeUrl, Icon: YoutubeIcon },
    {
      label: "WhatsApp",
      href: whatsapp ? `https://wa.me/${whatsapp}` : "",
      Icon: WhatsappIcon,
    },
  ].filter((s) => s.href);

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
          <div className="mt-3 flex items-center gap-4">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="text-brand-200 transition hover:text-white"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} {settings.siteName} — Tous droits réservés.
      </div>
    </footer>
  );
}
