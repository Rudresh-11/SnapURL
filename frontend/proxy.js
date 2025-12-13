import { NextResponse } from "next/server";

// Set this to your backend base URL (example: http://localhost:8000)
// IMPORTANT: must NOT include a trailing slash.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

async function isTokenValid(token) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `accessToken=${token}`,
      },
      cache: "no-store",
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("accessToken")?.value;
  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  // 1) No token -> block dashboard, allow home
  if (!token) {
    if (isDashboard) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // 2) Token exists -> validate via backend
  const valid = await isTokenValid(token);

  // 2a) Invalid token -> treat as logged out
  if (!valid) {
    if (isDashboard) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // 2b) Valid token -> block home
  if (isHome) return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
