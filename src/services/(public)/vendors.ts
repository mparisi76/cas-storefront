import directus from "@/lib/directus";
import { readItems, readUsers } from "@directus/sdk";
import { cache } from "react";

export interface PublicVendor {
  id: string;
  name: string; // Keeping this for backward compatibility if needed
  shop_name: string; // The primary display field
  slug: string;
}

export const getActiveVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    // We query directus_users for the Vendor role
    const response = await directus.request(
      readUsers({
        // Adding shop_name to the fields array
        fields: ["id", "first_name", "last_name", "shop_name"],
        filter: {
          role: { name: { _eq: "Vendor" } },
        },
        // Sort by shop_name for a more professional directory
        sort: ["shop_name"],
      }),
    );

    return response.map((user) => {
      // Logic to determine the display name
      const displayName =
        user.shop_name || `${user.first_name} ${user.last_name || ""}`.trim();

      return {
        id: user.id,
        shop_name: displayName,
        name: displayName, // Map to name as well to keep existing components happy
        slug: user.id,
      };
    });
  } catch (error) {
    console.error("Error fetching users as vendors:", error);
    return [];
  }
});

/**
 * Fetches a single vendor by its slug.
 */
export const getVendorBySlug = cache(
  async (slug: string): Promise<PublicVendor | null> => {
    try {
      // If your 'vendors' collection also uses shop_name, update fields here too
      const response = await directus.request(
        readItems("vendors", {
          fields: ["id", "name", "shop_name", "slug", "logo", "description"],
          filter: {
            slug: { _eq: slug },
            status: { _eq: "active" },
          },
          limit: 1,
        }),
      );

      const vendor = response[0] as PublicVendor;
      if (!vendor) return null;

      return {
        ...vendor,
        shop_name: vendor.shop_name || vendor.name,
      } as PublicVendor;
    } catch (error) {
      console.error(`Error fetching vendor with slug ${slug}:`, error);
      return null;
    }
  },
);
