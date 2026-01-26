import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("directus_session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // 1. We prepare the request to Directus
    // We send BOTH the Cookie header and the Bearer header to cover all config bases
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
      method: "GET",
      headers: {
        "Cookie": `directus_session=${sessionCookie.value}`,
        "Authorization": `Bearer ${sessionCookie.value}`,
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        // Directus sometimes checks the Origin even in server-to-server calls
        "Origin": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });

    // 2. Debugging: If it's still 401, we want to know why
    if (response.status === 401) {
      console.error("Directus rejected heartbeat session cookie.");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!response.ok) {
      return NextResponse.json({ authenticated: false }, { status: response.status });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Heartbeat Proxy Critical Failure:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}