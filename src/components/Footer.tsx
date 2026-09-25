import Link from "next/link";
import { getSettings } from "@/lib/settings";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
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

  const linkCls = "text-ink-500 transition hover:text-ink-950";

  return (
    <footer className="mt-16 border-t border-ink-200 bg-white text-ink-600">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo name={settings.siteName} variant="light" />
          <p className="mt-2 text-sm text-ink-500">
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
                  className="text-ink-500 transition hover:text-ink-950"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          )}
          <div className="mt-6">
            <NewsletterForm variant="footer" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-950">Boutique</p>
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-950">Aide</p>
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-950">Contact</p>
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
            <li className="text-ink-500">Lun – Sam, 9h à 18h</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-200 py-4 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} {settings.siteName} — Tous droits réservés.
      </div>
    </footer>
  );
}
