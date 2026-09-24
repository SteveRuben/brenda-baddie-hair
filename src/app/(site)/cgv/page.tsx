import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente de la boutique bree baddie hair.",
};

export const dynamic = "force-dynamic";

export default async function CgvPage() {
  const settings = await getSettings();
  const content =
    settings.cgv ||
    "Les conditions générales de vente sont en cours de rédaction.";
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Conditions générales de vente</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-700">
        {content}
      </p>
    </div>
  );
}
