import "server-only";
import { cookies } from "next/headers";
import { createDirectus, rest, staticToken } from "@directus/sdk";
import { ACCESS_COOKIE } from "@/lib/session";

/**
 * Returns true if the given user token has Directus admin access.
 * Asks Directus directly, so it can't be spoofed by role names or client state.
 */
export async function hasAdminAccess(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/policies/me/globals`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Admin check failed: /policies/me/globals returned ${res.status}`);
      return false;
    }
    const { data } = await res.json();
    return data?.admin_access === true;
  } catch (err) {
    console.error("Admin check failed:", err);
    return false;
  }
}

/**
 * For admin-only pages and actions. Returns a Directus client authenticated
 * as the logged-in admin, or null if there's no session or the user isn't an admin.
 * All admin reads/writes go through the admin's own token, so Directus
 * enforces the permissions; the storefront service token isn't involved.
 */
export async function getAdminSession() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token || !(await hasAdminAccess(token))) return null;

  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(token))
    .with(rest());
  return { token, client };
}
