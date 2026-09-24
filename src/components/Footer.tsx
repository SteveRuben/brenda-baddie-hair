import Link from "next/link";
import { getSettings } from "@/lib/settings";
import Logo from "./Logo";
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
  const email = settings.contactEmail;

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

  const linkCls = "hover:text-white";

  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo name={settings.siteName} variant="dark" />
          <p className="mt-2 text-sm text-brand-200">
            Des perruques premium pour révéler la baddie en vous. Qualité, style
            et confiance.
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
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
          )}
        </div>
        <div>
          <p className="font-bold text-white">Boutique</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/collection" className={linkCls}>
                Collections
              </Link>
            </li>
            <li>
              <Link href="/panier" className={linkCls}>
                Panier
              </Link>
            </li>
            <li>
              <Link href="/compte" className={linkCls}>
                Mon compte
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white">Aide</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/a-propos" className={linkCls}>
                À propos
              </Link>
            </li>
            <li>
              <Link href="/retours" className={linkCls}>
                Retours & échanges
              </Link>
            </li>
            <li>
              <Link href="/livraison" className={linkCls}>
                Livraison
              </Link>
            </li>
            <li>
              <Link href="/contact" className={linkCls}>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className={linkCls}>
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgv" className={linkCls}>
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className={linkCls}>
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
        <div id="contact">
          <p className="font-bold text-white">Contact</p>
          <ul className="mt-2 space-y-1 text-sm">
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className={linkCls}
                >
                  WhatsApp
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className={`${linkCls} break-all`}>
                  {email}
                </a>
              </li>
            )}
            <li className="text-brand-200">Lun – Sam, 9h à 18h</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} {settings.siteName} — Tous droits réservés.
      </div>
    </footer>
  );
}
