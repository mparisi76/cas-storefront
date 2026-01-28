import directus from "@/lib/directus";
import { readItems, readUsers } from "@directus/sdk";
import { cache } from "react";

export interface PublicVendor {
  id: string;
  name: string;
  slug: string; // We'll use ID as the slug if you don't have a slug field
}

export const getActiveVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    // We query directus_users.
    // Usually, you'll want to filter by a specific Role ID (e.g., your 'Vendors' role)
    const response = await directus.request(
      readUsers({
        fields: ["id", "first_name", "last_name"],
        filter: {
          role: { name: { _eq: "Vendor" } }, // Adjust this to match your Role name
        },
        sort: ["first_name"],
      }),
    );

    return response.map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name || ""}`.trim(),
      slug: user.id, // Using ID as the unique identifier for the URL
    }));
  } catch (error) {
    console.error("Error fetching users as vendors:", error);
    return [];
  }
});

/**
 * Fetches a single vendor by its slug.
 * Useful for specific Shop Profile pages.
 */
export const getVendorBySlug = cache(
  async (slug: string): Promise<PublicVendor | null> => {
    try {
      const response = await directus.request(
        readItems("vendors", {
          fields: ["id", "name", "slug", "logo", "description"],
          filter: {
            slug: { _eq: slug },
            status: { _eq: "active" },
          },
          limit: 1,
        }),
      );

      return (response[0] as PublicVendor) || null;
    } catch (error) {
      console.error(`Error fetching vendor with slug ${slug}:`, error);
      return null;
    }
  },
);
