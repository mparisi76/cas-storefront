"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthState = { error?: string } | null;

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ 
        email, 
        password,
        mode: "cookie" // This tells Directus to manage the long-lived session
      }),
      headers: { "Content-Type": "application/json" },
    });

    const authData = await res.json();

    if (!res.ok) return { error: "Invalid Credentials" };

    // Directus will return the access_token, but it also sends back 
    // a 'Set-Cookie' header for the refresh_token automatically.
    const cookieStore = await cookies();
    
    // We store the access_token so our Middleware can quickly check it,
    // but the real "anchor" is now the refresh_token Directus just set.
    cookieStore.set("directus_session", authData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // We set a long maxAge here so the browser keeps the cookie for a week
      maxAge: 60 * 60 * 24 * 7, 
    });

  } catch {
    return { error: "Connection to Server failed" };
  }

  redirect("/dashboard");
}