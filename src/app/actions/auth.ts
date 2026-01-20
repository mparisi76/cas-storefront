// src/app/actions/auth.ts
"use server";

import { AuthResponse } from "@/types/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Define the shape of our state
export type AuthState = {
  error?: string;
} | null;

export async function loginAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      },
    );

    const authData = await res.json();

    if (!res.ok) {
      return { error: "Invalid Credentials" };
    }

    const cookieStore = await cookies();
    cookieStore.set("directus_session", authData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } catch {
    return { error: "Connection to Archival Server failed" };
  }

  // Redirects must happen outside of try/catch blocks in Server Actions
  redirect("/dashboard");
}

// src/app/actions/auth.ts

/**
 * Destroys the session by deleting the cookie and
 * redirects the user back to the login page.
 */
export async function logoutAction() {
  const cookieStore = await cookies();

  // Delete the session cookie
  cookieStore.delete("directus_session");

  // Send the user back to the login screen
  redirect("/login");
}

export async function registerAction(
  prevState: AuthResponse | null,
  formData: FormData,
): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Replace with your actual Vendor Role ID from Directus
  const VENDOR_ROLE_ID = "YOUR_DIRECTUS_VENDOR_ROLE_UUID";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: VENDOR_ROLE_ID,
          status: "active",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      // Handle Directus specific error array
      const message = errorData.errors?.[0]?.message || "Registration failed.";
      return { error: message };
    }

    // Redirecting is handled outside of the return for TypeScript clarity
  } catch {
    return { error: "An unexpected error occurred during registration." };
  }

  // Redirect after the try/catch block
  redirect("/login?registered=true");
}
