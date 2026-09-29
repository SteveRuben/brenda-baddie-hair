-- Liens de paiement partageables (ex. envoyés via WhatsApp) :
-- un jeton unique et imprévisible par commande, avec expiration optionnelle.
ALTER TABLE "Order" ADD COLUMN "paymentToken" TEXT;
ALTER TABLE "Order" ADD COLUMN "tokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_paymentToken_key" ON "Order"("paymentToken");
