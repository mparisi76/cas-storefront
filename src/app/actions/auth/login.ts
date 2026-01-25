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
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const authData = await res.json();

    if (!res.ok) return { error: "Invalid Credentials" };

    const cookieStore = await cookies();
    cookieStore.set("directus_session", authData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Optional: Set maxAge based on Directus authData.data.expires
    });
  } catch {
    return { error: "Connection to Archival Server failed" };
  }

  redirect("/dashboard");
}