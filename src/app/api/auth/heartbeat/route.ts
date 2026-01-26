import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("directus_session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // 1. Instead of just checking /users/me, we hit the refresh endpoint.
    // This tells Directus to extend the session and issue a NEW cookie.
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        refresh_token: sessionCookie.value, // Directus session cookies are usually refresh tokens
        mode: "cookie", // This tells Directus to send back a Set-Cookie header
      }),
    });

    if (!response.ok) {
      // If refresh fails, the session is truly dead
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 2. IMPORTANT: Directus will send a NEW cookie in the response headers.
    // We must pass that new cookie back to the browser.
    const setCookieHeader = response.headers.get("set-cookie");
    const apiResponse = NextResponse.json({ authenticated: true });

    if (setCookieHeader) {
      apiResponse.headers.set("set-cookie", setCookieHeader);
    }

    return apiResponse;
  } catch (error) {
    console.error("Heartbeat Refresh Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}