import Stripe from "stripe";

// Client Stripe initialisé à la demande (jamais au chargement du module,
// pour ne pas planter le build/prerender quand la clé est absente).
export function stripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    // Timeout anti-blocage : un appel Stripe qui pend ne doit pas bloquer
    // la requête indéfiniment (DoS par épuisement des workers).
    timeout: 15000,
  });
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
