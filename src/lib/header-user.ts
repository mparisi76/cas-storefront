import "server-only";
import { createDirectus, rest, staticToken, readMe, aggregate } from "@directus/sdk";
import { hasAdminAccess } from "@/lib/admin";

/** What the site header needs to know about the logged-in user. */
export type HeaderUser = {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  pendingVendors: number;
};

/**
 * Loads the header user for a valid access token. Used by the portal layout
 * (server-rendered) and /api/me (storefront pages), so both show the same thing.
 * Returns null if the token can't read the user.
 */
export async function loadHeaderUser(token: string): Promise<HeaderUser | null> {
  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(staticToken(token)).with(rest());

  try {
    const [me, isAdmin] = await Promise.all([
      client.request(readMe({ fields: ["first_name", "last_name", "email", "avatar", { role: ["name"] }] })) as Promise<{
        first_name: string | null;
        last_name: string | null;
        email: string;
        avatar: string | null;
        role?: { name: string } | null;
      }>,
      hasAdminAccess(token),
    ]);

    // Admins get a badge with the number of vendor applications to review.
    let pendingVendors = 0;
    const vendorRoleId = process.env.DIRECTUS_VENDOR_ROLE_ID;
    if (isAdmin && vendorRoleId) {
      try {
        const counts = await client.request(
          aggregate("directus_users", {
            aggregate: { count: "*" },
            query: { filter: { role: { _eq: vendorRoleId }, status: { _eq: "draft" } } },
          }),
        );
        pendingVendors = Number(counts[0]?.count ?? 0);
      } catch (err) {
        console.error("Failed to count pending vendors:", err);
      }
    }

    return {
      name: `${me.first_name || ""} ${me.last_name || ""}`.trim() || me.email,
      email: me.email,
      role: isAdmin ? "Admin" : me.role?.name || "Vendor",
      avatarUrl: me.avatar
        ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${me.avatar}?width=72&height=72&fit=cover`
        : null,
      isAdmin,
      pendingVendors,
    };
  } catch (e) {
    console.error("Header user load failed:", e);
    return null;
  }
}
