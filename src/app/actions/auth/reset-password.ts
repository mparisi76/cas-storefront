"use server";

import { createDirectus, rest, passwordRequest, passwordReset } from "@directus/sdk";

export async function requestPasswordResetAction(email: string) {
  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());

    // This triggers Directus to send the configured email template
    // The reset_url should point to a page we'll build next: /reset-password
    await client.request(
      passwordRequest(email, `${process.env.NEXT_PUBLIC_URL}/reset-password`)
    );

    return { success: true };
  } catch (error: unknown) {
    console.error("Password reset error:", error);
    return { error: "Could not send reset email." };
  }
}
/**
 * Completes a password reset from the emailed link. Runs on the server
 * because Directus doesn't allow direct browser (CORS) requests.
 */
export async function completePasswordResetAction(token: string, password: string) {
  if (typeof token !== "string" || !token || typeof password !== "string") {
    return { error: "Invalid or expired link. Please request a new one." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());
    await client.request(passwordReset(token, password));
    return { success: true as const };
  } catch (error: unknown) {
    console.error("Password reset completion failed:", error);
    return { error: "Link expired. Please request a new one." };
  }
}
