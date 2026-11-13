"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REFRESH_COOKIE, clearSessionCookies } from "@/lib/session";

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // Revoke the session in Directus so the refresh token can't be reused.
  if (refreshToken) {
    await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
      cache: "no-store",
    }).catch((err) => console.error("Directus logout failed:", err));
  }

  clearSessionCookies(cookieStore);
  redirect("/login");
}
