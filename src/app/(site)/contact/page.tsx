import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { WhatsappIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "Contact — bree baddie hair",
  description:
    "Contactez bree baddie hair : WhatsApp, email et horaires du service client.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsapp = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const email = settings.contactEmail;
  const waText = encodeURIComponent(
    settings.whatsappChatMessage || "Bonjour bree baddie hair, j'ai une question !"
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Contactez-nous</h1>
      <p className="mt-4 leading-relaxed text-neutral-700">
        Une question sur un modèle, votre commande ou un retour ? Notre équipe
        vous répond avec plaisir.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-ink-500 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-green-600">
                <WhatsappIcon size={28} />
              </span>
              <p className="text-lg font-bold">WhatsApp</p>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Le moyen le plus rapide : écrivez-nous directement, nous répondons
              en général en quelques heures.
            </p>
            <p className="mt-3 text-sm font-semibold text-ink-950">
              Discuter sur WhatsApp
            </p>
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-ink-500 hover:shadow-md"
          >
            <p className="text-lg font-bold">Email</p>
            <p className="mt-2 text-sm text-neutral-600">
              Pour toute demande détaillée, écrivez-nous à :
            </p>
            <p className="mt-3 text-sm font-semibold text-ink-950 break-all">
              {email}
            </p>
          </a>
        )}
      </div>
      <div className="mt-8 rounded-2xl bg-ink-50 p-6">
        <p className="font-bold text-neutral-900">Horaires du service client</p>
        <p className="mt-1 text-sm text-neutral-600">
          Lundi à samedi, de 9h à 18h. Les messages reçus en dehors de ces
          horaires sont traités dès le prochain jour ouvré.
        </p>
      </div>
    </div>
  );
}
