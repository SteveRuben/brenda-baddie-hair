import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import ProductCard from "@/components/ProductCard";
import NewsletterForm from "@/components/NewsletterForm";

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
  const [featured, settings, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "active", featured: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: { select: { priceUSD: true, priceEUR: true } },
      },
      take: 6,
    }),
    getSettings(),
    prisma.category.findMany({
      include: { _count: { select: { products: { where: { status: "active" } } } } },
      orderBy: { name: "asc" },
    }),
  ]);
  const visibleCategories = categories.filter((c) => c._count.products > 0);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: settings.siteName,
            url: SITE_URL,
            logo: `${SITE_URL}/images/logo-embleme.webp`,
            sameAs: [
              settings.instagramUrl,
              settings.tiktokUrl,
              settings.facebookUrl,
              settings.youtubeUrl,
            ].filter(Boolean),
          }),
        }}
      />
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
          <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-950 to-black" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl tracking-tight md:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-300">
            {settings.heroSubtitle}
          </p>
          <Link
            href="/collection"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-ink-950 shadow-lg transition hover:scale-105"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

      {/* Bloc d'information (configurable dans Paramètres, masqué si vide) */}
      {settings.announcementText.trim() && (
        <section className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="font-display text-4xl">{settings.announcementTitle}</h2>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-600">
            {renderRich(settings.announcementText)}
          </p>
        </section>
      )}

      {/* Produits vedettes */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">Nos coups de cœur</h2>
          <Link href="/collection" className="text-sm font-semibold text-ink-900 hover:underline">
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

      {/* Nos catégories (façon "Notre sélection" de Nandi's Wigs) */}
      {visibleCategories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center font-display text-3xl">
            Notre sélection
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {visibleCategories.map((c) => (
              <Link
                key={c.id}
                href={`/collection?categorie=${encodeURIComponent(c.slug)}`}
                className="group flex flex-col items-center rounded-2xl bg-ink-950 px-6 py-10 text-center text-white transition hover:shadow-lg"
              >
                <span className="text-lg font-extrabold uppercase tracking-wide">
                  {c.name}
                </span>
                <span className="mt-1 text-sm text-ink-300">
                  {c._count.products} modèle{c._count.products > 1 ? "s" : ""}
                </span>
                <span className="mt-4 text-sm font-bold underline-offset-4 group-hover:underline">
                  Découvrir →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* À propos */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-3xl">{settings.aboutTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">{settings.aboutText}</p>
      </section>

      {/* Arguments */}
      <section className="bg-ink-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
          {[
            { t: "Qualité premium", d: "Des fibres et finitions sélectionnées avec exigence." },
            { t: "Paiement sécurisé", d: "Payez en toute confiance via PayPal, en USD ou EUR." },
            { t: "Expédition suivie", d: "Chaque commande est préparée avec soin et suivie." },
          ].map((a) => (
            <div key={a.t} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-ink-950">{a.t}</h3>
              <p className="mt-2 text-sm text-neutral-600">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter (colle au footer : compense son mt-16) */}
      <div className="-mb-16">
        <NewsletterForm />
      </div>
    </div>
  );
}
