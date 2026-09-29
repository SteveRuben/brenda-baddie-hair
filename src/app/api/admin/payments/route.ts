import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/security";
import { getPaymentMethodStatus } from "@/lib/payments";

// Statut des moyens de paiement pour le backoffice (aucun secret exposé).
export async function GET() {
  if (!(await requireStaff()).ok)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  try {
    const methods = await getPaymentMethodStatus();
    return NextResponse.json({ methods });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
