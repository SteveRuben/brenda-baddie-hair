import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === "/admin/login";
  const isSetupPage = pathname === "/admin/setup";
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (pathname.startsWith("/admin") && !isLoginPage && !isSetupPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
  if ((isLoginPage || isSetupPage) && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  // Espace client : pages publiques = connexion + inscription
  const isComptePublic =
    pathname === "/compte/connexion" || pathname === "/compte/inscription";
  if (pathname.startsWith("/compte") && !isComptePublic) {
    if (!isLoggedIn || role !== "customer") {
      return NextResponse.redirect(new URL("/compte/connexion", req.nextUrl));
    }
  }
  if (isComptePublic && isLoggedIn && role === "customer") {
    return NextResponse.redirect(new URL("/compte", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
