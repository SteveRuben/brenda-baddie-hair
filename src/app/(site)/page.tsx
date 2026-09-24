import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

// Mini-rendu : **gras** → <strong>, le reste en texte brut.
function renderRich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default async function Home() {
  const [featured, settings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active", featured: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: { select: { priceUSD: true, priceEUR: true } },
      },
      take: 6,
    }),
    getSettings(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        {settings.heroImageUrl ? (
          <>
            <img
              src={settings.heroImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            {settings.heroSubtitle}
          </p>
          <Link
            href="/collection"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-brand-700 shadow-lg transition hover:scale-105"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

      {/* Bloc d'information (configurable dans Paramètres, masqué si vide) */}
      {settings.announcementText.trim() && (
        <section className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-3xl font-extrabold">{settings.announcementTitle}</h2>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-600">
            {renderRich(settings.announcementText)}
          </p>
        </section>
      )}

      {/* Produits vedettes */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Nos coups de cœur</h2>
          <Link href="/collection" className="text-sm font-semibold text-brand-600 hover:underline">
            Tout voir →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            Les produits arrivent bientôt — revenez vite !
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* À propos */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-extrabold">{settings.aboutTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">{settings.aboutText}</p>
      </section>

      {/* Arguments */}
      <section className="bg-brand-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
          {[
            { t: "Qualité premium", d: "Des fibres et finitions sélectionnées avec exigence." },
            { t: "Paiement sécurisé", d: "Payez en toute confiance via PayPal, en USD ou EUR." },
            { t: "Expédition suivie", d: "Chaque commande est préparée avec soin et suivie." },
          ].map((a) => (
            <div key={a.t} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-brand-700">{a.t}</h3>
              <p className="mt-2 text-sm text-neutral-600">{a.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
