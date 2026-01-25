"use server";

import { createDirectus, rest, passwordRequest } from "@directus/sdk";

export async function requestPasswordResetAction(email: string) {
  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());

    // This triggers Directus to send the configured email template
    // The reset_url should point to a page we'll build next: /reset-password
    await client.request(
      passwordRequest(email, `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`)
    );

    return { success: true };
  } catch (error: unknown) {
    console.error("Password reset error:", error);
    return { error: "Could not send reset email." };
  }
}