import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  // If there is no cookie, the user is already logged out
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // We call Directus from the server, where we can manually 
    // pass the token in the Authorization header.
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (response.status === 401) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!response.ok) {
      throw new Error("Directus heartbeat failed");
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Heartbeat Proxy Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}