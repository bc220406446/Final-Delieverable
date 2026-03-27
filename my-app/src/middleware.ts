// Middleware — protects dashboard routes from unauthenticated access.
// Runs on the Edge before any page renders, so users never see a flash
// of protected content before being redirected.

import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard/user",
  "/dashboard/admin",
];

// Routes only accessible when NOT logged in (redirect logged-in users away)
const AUTH_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
];

// Public routes that are always accessible regardless of auth state
const ALWAYS_PUBLIC = ["/logout", "/otp-verification", "/confirm-email"];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Read token from localStorage is not possible in middleware (Edge runtime).
  // Instead we use a cookie. We need to set this cookie on login.
  // Cookie name matches what we'll set in AuthContext.
  const token = request.cookies.get("csep_token")?.value;

  // Always allow public routes through
  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtected  = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly   = AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p));

  // Not logged in + trying to access protected route → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Logged in + trying to access login/register → redirect to dashboard
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these paths — skip static files, API routes, etc.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-email",
    "/logout",
  ],
};
