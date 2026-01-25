"use server";

import { redirect } from "next/navigation";
import { createDirectus, rest, staticToken, createUser } from "@directus/sdk";

export type AuthResponse = { error?: string; success?: boolean } | null;

interface DirectusError {
  errors: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export async function registerAction(
  prevState: AuthResponse,
  formData: FormData
): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  // Updated to use your specific variable name
  const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
  const vendorRoleId = process.env.DIRECTUS_VENDOR_ROLE_ID;

  if (!url || !adminToken) {
    console.error("Missing Env Vars:", { url: !!url, token: !!adminToken });
    return { error: "Server configuration missing." };
  }

  const client = createDirectus(url)
    .with(staticToken(adminToken))
    .with(rest());

  try {
    await client.request(
      createUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        role: vendorRoleId,
        status: "active",
      })
    );
  } catch (err: unknown) {
    const error = err as DirectusError;
    
    // This will now show the REAL reason in your terminal
    console.error("Directus Error Details:", JSON.stringify(error.errors, null, 2));
    
    const message = error.errors?.[0]?.message || "Registration failed.";
    return { error: message };
  }

  redirect("/login?registered=true");
}