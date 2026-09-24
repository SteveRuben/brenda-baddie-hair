// URL publique du site : variable d'environnement en priorité,
// URL Railway en repli (à mettre à jour si domaine personnalisé).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://brenda-baddie-hair-production.up.railway.app";
