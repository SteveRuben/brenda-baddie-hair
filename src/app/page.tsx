import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await prisma.product.findMany({
    where: { status: "active", featured: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 6,
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Révèle la baddie en toi
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Des perruques premium, une qualité irréprochable et un style qui ne passe
            jamais inaperçu.
          </p>
          <Link
            href="/catalogue"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-brand-700 shadow-lg transition hover:scale-105"
          >
            Découvrir le catalogue
          </Link>
        </div>
      </section>

      {/* Produits vedettes */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Nos coups de cœur</h2>
          <Link href="/catalogue" className="text-sm font-semibold text-brand-600 hover:underline">
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
