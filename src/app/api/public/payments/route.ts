import { NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/payments";

// Méthodes de paiement activées, exposées au tunnel de commande.
// Aucun secret n'est renvoyé (la clé publique Stripe est publique par nature).
export async function GET() {
  try {
    const methods = await getEnabledPaymentMethods();
    return NextResponse.json({ methods });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ methods: [] });
  }
}
