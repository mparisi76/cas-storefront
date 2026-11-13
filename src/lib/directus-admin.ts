import "server-only";
import { createDirectus, rest, staticToken } from "@directus/sdk";

/**
 * Server-only Directus client authenticated with the admin static token.
 * Use ONLY for trusted server-side operations (webhooks, price lookups).
 * Never import this from a client component.
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  if (!url || !token) {
    throw new Error("NEXT_PUBLIC_DIRECTUS_URL or DIRECTUS_STATIC_TOKEN is missing");
  }
  return createDirectus(url).with(staticToken(token)).with(rest());
}
