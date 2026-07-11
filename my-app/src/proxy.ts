// Next.js proxy protects authenticated pages before React renders them.

import { NextRequest, NextResponse } from "next/server";

// User dashboard routes require a valid login cookie.
const PROTECTED_PREFIXES = [
  "/user",
];

// Auth pages should not be opened again after a user is already logged in.
const AUTH_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
];

// These routes stay available even without checking login state.
const ALWAYS_PUBLIC = ["/logout", "/otp-verification", "/confirm-email"];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Proxy cannot read localStorage, so AuthContext mirrors the JWT into this cookie.
  const token = request.cookies.get("csep_token")?.value;

  // Always allow public routes through.
  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p));

  // Visitors must log in before opening dashboard pages.
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in users are sent away from login/register style pages.
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  return NextResponse.next();
}

// Only run proxy on app routes that need auth decisions.
export const config = {
  matcher: [
    "/user/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-email",
    "/logout",
  ],
};
