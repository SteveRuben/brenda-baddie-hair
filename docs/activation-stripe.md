# Activer Stripe (paiement par carte bancaire)

Procédure d'activation du paiement par carte sur la boutique **bree baddie hair**.
Le code est déjà en place (registre `src/lib/payments.ts`, Checkout hébergé Stripe,
webhook `/api/stripe/webhook`) — il reste la configuration côté Stripe et Railway.

## 1. Créer un compte Stripe

Aller sur [stripe.com](https://stripe.com) et créer le compte de la boutique.
Rester en **mode test** pour commencer (interrupteur « Test » dans le dashboard Stripe).

## 2. Ajouter les secrets dans Railway

Railway → projet → service → **Variables** :

| Variable                | Valeur                                        |
|-------------------------|-----------------------------------------------|
| `STRIPE_SECRET_KEY`     | Clé secrète (`sk_test_…`, puis `sk_live_…`)    |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook (`whsec_…`, voir étape 4)   |

Ne jamais mettre ces clés dans le backoffice ni dans le chat.

## 3. Configurer le backoffice

Backoffice → **Paramètres → Paiements** :

1. Cocher « Activer le paiement par carte (Stripe) »
2. Coller la **clé publique** (`pk_test_…`, puis `pk_live_…`) dans le champ prévu

PayPal reste actif tel quel (affiché en lecture seule).

## 4. Déclarer le webhook dans Stripe

Dashboard Stripe → **Développeurs → Webhooks** → Ajouter un endpoint :

- URL : `https://brenda-baddie-hair-production.up.railway.app/api/stripe/webhook`
- Événement : `checkout.session.completed`
- Recopier le **secret de signature** (`whsec_…`) dans la variable Railway
  `STRIPE_WEBHOOK_SECRET` (étape 2)

## 5. Tester en mode test

1. Clés `sk_test_…` / `pk_test_…` en place, interrupteur Stripe activé, redéploiement fait
2. Passer une commande → choisir **« Carte bancaire »** → « Payer par carte »
3. Carte `4242 4242 4242 4242`, date d'expiration future, CVC quelconque
4. Vérifier :
   - la page de confirmation affiche la commande confirmée ;
   - la commande est `paid` / `confirmed` dans le kanban ;
   - le stock de la variante est décrémenté ;
   - l'email de confirmation est reçu.

Cas limites déjà gérés par le code : abandon sur la page Stripe (reprise sans
doublon via `?orderId=`), webhook rejoué (idempotent, pas de double décrément),
signature invalide (400).

## 6. Passer en production

1. Dans le dashboard Stripe, basculer en **mode live**
2. Remplacer les clés par les versions `sk_live_…` / `pk_live_…`
   (Railway + backoffice)
3. Recréer le webhook en mode live et mettre à jour `STRIPE_WEBHOOK_SECRET`
4. Refaire un achat test d'1 € (remboursable depuis le dashboard Stripe)
