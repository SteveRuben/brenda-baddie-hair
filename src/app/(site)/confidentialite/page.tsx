import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et protection de vos données personnelles (RGPD) — bree baddie hair.",
};

export const dynamic = "force-dynamic";

export default async function ConfidentialitePage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Politique de confidentialité</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-700">
        {settings.privacyPolicy}
      </p>
    </div>
  );
}
