// Next.js API route to set/clear the auth cookie server-side.
// Called by AuthContext after login so middleware can read it reliably.

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "csep_token";

export async function POST(req: NextRequest) {
  const { token, remember } = await req.json();
  const maxAge = remember ? 60 * 60 * 24 * 7 : undefined;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    path:     "/",
    sameSite: "lax",
    httpOnly: false,
    secure:   process.env.NODE_ENV === "production",
    ...(maxAge ? { maxAge } : {}),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    path:     "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge:   0,
  });
  return res;
}
