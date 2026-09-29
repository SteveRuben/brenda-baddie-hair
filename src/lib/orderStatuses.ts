import { prisma } from "@/lib/prisma";

export interface OrderStatusInfo {
  key: string;
  label: string;
  color: string;
  position: number;
}

// Statuts système par défaut — utilisés en repli si la table est vide
// (ex. migration pas encore appliquée) et pour valider les clés.
export const DEFAULT_ORDER_STATUSES: OrderStatusInfo[] = [
  { key: "pending", label: "En attente", color: "#64748b", position: 0 },
  { key: "confirmed", label: "Confirmée", color: "#2563eb", position: 1 },
  { key: "shipped", label: "Expédiée", color: "#d97706", position: 2 },
  { key: "delivered", label: "Livrée", color: "#16a34a", position: 3 },
  { key: "cancelled", label: "Annulée", color: "#dc2626", position: 4 },
];

// Statut sur lequel les commandes sont créées — suppression interdite.
export const PROTECTED_STATUS_KEY = "pending";

export async function getOrderStatuses(): Promise<OrderStatusInfo[]> {
  try {
    const rows = await prisma.orderStatus.findMany({ orderBy: { position: "asc" } });
    if (rows.length === 0) return DEFAULT_ORDER_STATUSES;
    return rows.map((r) => ({
      key: r.key,
      label: r.label,
      color: r.color,
      position: r.position,
    }));
  } catch {
    // Table inexistante (migration non appliquée) : repli défensif.
    return DEFAULT_ORDER_STATUSES;
  }
}

export async function isValidOrderStatusKey(key: string): Promise<boolean> {
  if (!key || typeof key !== "string") return false;
  try {
    const count = await prisma.orderStatus.count({ where: { key } });
    if (count > 0) return true;
    // Repli : la table est vide ou absente, on accepte les clés système.
    const total = await prisma.orderStatus.count();
    if (total === 0) return DEFAULT_ORDER_STATUSES.some((s) => s.key === key);
    return false;
  } catch {
    return DEFAULT_ORDER_STATUSES.some((s) => s.key === key);
  }
}

// "En préparation" -> "en-preparation" ; "Prêt !" -> "pret"
export function slugifyStatusLabel(label: string): string {
  const base =
    label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "statut";
  return base.slice(0, 40);
}

export async function uniqueStatusKey(base: string): Promise<string> {
  let key = base;
  let i = 2;
  while (await prisma.orderStatus.findUnique({ where: { key } })) {
    key = `${base}-${i}`;
    i += 1;
  }
  return key;
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}
