-- Statuts de commande configurables (kanban backoffice)
CREATE TABLE "OrderStatus" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderStatus_key_key" ON "OrderStatus"("key");

-- Valeurs par défaut (alignées sur les anciens libellés)
INSERT INTO "OrderStatus" ("id", "key", "label", "color", "position") VALUES
    ('ordstat_pending', 'pending', 'En attente', '#64748b', 0),
    ('ordstat_confirmed', 'confirmed', 'Confirmée', '#2563eb', 1),
    ('ordstat_shipped', 'shipped', 'Expédiée', '#d97706', 2),
    ('ordstat_delivered', 'delivered', 'Livrée', '#16a34a', 3),
    ('ordstat_cancelled', 'cancelled', 'Annulée', '#dc2626', 4)
ON CONFLICT ("id") DO NOTHING;
