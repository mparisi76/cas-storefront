import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  isAccessTokenFresh,
  refreshSession,
  setSessionCookies,
} from "@/lib/session";

// NOTE: don't add upload/API routes here. Next.js buffers request bodies that
// pass through middleware and silently truncates them at 10 MB, which breaks
// multi-image uploads. /api/upload handles its own session refresh instead.
const isProtected = (pathname: string) => pathname.startsWith("/dashboard");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // 1. Logged-in users hitting /login or / go straight to the dashboard.
  //    Verified against Directus (not just JWT expiry) so a revoked token can't
  //    cause a /login <-> /dashboard redirect loop.
  if (pathname === "/login" || pathname === "/") {
    if (isAccessTokenFresh(accessToken)) {
      try {
        const me = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        if (me.ok) return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Directus unreachable: just show the page.
      }
    }
    return NextResponse.next();
  }

  if (!isProtected(pathname)) return NextResponse.next();

  // 2. Access token still good: continue. (The dashboard layout validates it
  //    against Directus, so we skip an extra round trip here.)
  if (isAccessTokenFresh(accessToken)) return NextResponse.next();

  // 3. Expired or missing: try a silent refresh.
  if (refreshToken) {
    const result = await refreshSession(refreshToken);

    if (result.ok) {
      // Update the *incoming* request so pages/actions rendered for this request
      // see the new token via cookies(), then persist it to the browser.
      request.cookies.set(ACCESS_COOKIE, result.tokens.access_token);
      request.cookies.set(REFRESH_COOKIE, result.tokens.refresh_token);
      const response = NextResponse.next({ request: { headers: request.headers } });
      setSessionCookies(response.cookies, result.tokens);
      return response;
    }

    if (result.reason === "network") {
      // Directus is down: don't destroy a possibly valid session.
      return pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Auth service unavailable" }, { status: 503 })
        : new NextResponse("Service temporarily unavailable. Please try again shortly.", { status: 503 });
    }
  }

  // 4. No valid session.
  const failure = pathname.startsWith("/api/")
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  clearSessionCookies(failure.cookies);
  return failure;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
