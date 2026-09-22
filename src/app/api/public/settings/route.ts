import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

// Paramètres publics exposés au front (sans authentification)
export async function GET() {
  const [shippingFeeUSD, shippingFeeEUR, siteName] = await Promise.all([
    getSetting("shippingFeeUSD"),
    getSetting("shippingFeeEUR"),
    getSetting("siteName"),
  ]);
  return NextResponse.json({
    shippingFeeUSD: Number(shippingFeeUSD) || 0,
    shippingFeeEUR: Number(shippingFeeEUR) || 0,
    siteName,
  });
}
