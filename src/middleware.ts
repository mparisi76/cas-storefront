import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("directus_session")?.value;

  // 1. HANDLE LOGIN PAGE REDIRECT (If already logged in)
  if (pathname === "/login" || pathname === "/") {
    if (accessToken) {
      try {
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (checkResponse.ok) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // If token is invalid, we stay on /login and let them log in fresh
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 2. ONLY RUN AUTH LOGIC FOR DASHBOARD ROUTES
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // 3. IF NO TOKEN ON DASHBOARD, REDIRECT TO LOGIN
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 4. CHECK IF CURRENT ACCESS TOKEN IS VALID
    const checkResponse = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (checkResponse.ok) {
      return NextResponse.next();
    }

    // 5. ATTEMPT SILENT REFRESH (If 401)
    if (checkResponse.status === 401) {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify({ mode: "cookie" }),
        },
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.data.access_token;

        const response = NextResponse.next();
        response.cookies.set("directus_session", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        const setCookieHeader = refreshResponse.headers.get("set-cookie");
        if (setCookieHeader) {
          response.headers.set("set-cookie", setCookieHeader);
        }

        return response;
      }
    }
  } catch (error) {
    console.error("Middleware Auth Error:", error);
  }

  // 6. FINAL FALLBACK: NUKE SESSION AND LOGIN
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reason", "expired");
  const failureResponse = NextResponse.redirect(loginUrl);
  failureResponse.cookies.delete("directus_session");
  return failureResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
