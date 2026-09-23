import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, rateLimitKey } from "@/lib/security";

const { GET, POST: authPOST } = handlers;

export { GET };

// Anti brute-force sur les tentatives de connexion (les 2 providers passent ici)
export async function POST(req: NextRequest) {
  if (!rateLimit(rateLimitKey(req, "auth"), 30, 60_000)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessayez dans une minute." },
      { status: 429 }
    );
  }
  return authPOST(req);
}
