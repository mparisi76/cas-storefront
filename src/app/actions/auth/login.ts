"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setSessionCookies } from "@/lib/session";

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
        // json mode returns the refresh token in the body so we can store it
        // in our own httpOnly cookie (see lib/session.ts).
        mode: "json",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const authData = await res.json();

    if (!res.ok) return { error: "Invalid Credentials" };

    const tokens = authData?.data;
    if (!tokens?.access_token || !tokens?.refresh_token) {
      return { error: "Login failed. Please try again." };
    }

    setSessionCookies(await cookies(), tokens);
  } catch {
    return { error: "Connection to Server failed" };
  }

  redirect("/dashboard");
}