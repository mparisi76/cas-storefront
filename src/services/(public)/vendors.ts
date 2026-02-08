import directus from "@/lib/directus";
import { PublicVendor } from "@/types/vendor";
import { readUsers } from "@directus/sdk";
import { cache } from "react";

/**
 * Internal interface to represent the raw Directus user response
 * before it is mapped to our PublicVendor type.
 */
interface DirectusUserRaw {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  shop_name?: string | null;
  avatar?: string | null;
  featured_vendor?: boolean | null;
}

/**
 * Normalizes user data into the PublicVendor format.
 * Maps Directus system user fields to your specific PublicVendor interface.
 */
const mapUserToVendor = (user: DirectusUserRaw): PublicVendor => {
  return {
    id: user.id,
    email: user.email || "",
    first_name: user.first_name || "Independent",
    last_name: user.last_name || "Vendor",
    shop_name: user.shop_name || `${user.first_name || "Independent"} ${user.last_name || "Vendor"}`.trim(),
    slug: user.id, // Using ID as slug for system users
    logo: user.avatar
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${user.avatar}`
      : null,
    featured_vendor: !!user.featured_vendor,
  };
};

export const getActiveVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    const response = await directus.request(
      readUsers({
        fields: [
          "id",
          "email",
          "first_name",
          "last_name",
          "shop_name",
          "avatar",
          "featured_vendor",
        ],
        filter: {
          role: { name: { _eq: "Vendor" } },
        },
      }),
    );

    // Casting the response to our internal raw type to satisfy the mapper
    const mappedVendors = (response as DirectusUserRaw[]).map(mapUserToVendor);

    // Sort by shop_name as the primary display field
    return mappedVendors.sort((a, b) => 
      (a.shop_name || "").localeCompare(b.shop_name || "")
    );
  } catch (error) {
    console.error("Error fetching users as vendors:", error);
    return [];
  }
});

export const getFeaturedVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    const response = await directus.request(
      readUsers({
        fields: [
          "id",
          "email",
          "first_name",
          "last_name",
          "shop_name",
          "avatar",
          "featured_vendor",
        ],
        filter: {
          _and: [
            { role: { name: { _eq: "Vendor" } } },
            { featured_vendor: { _eq: true } },
          ],
        },
        limit: 10,
      }),
    );

    return (response as DirectusUserRaw[]).map(mapUserToVendor);
  } catch (error) {
    console.error("Error fetching featured vendors:", error);
    return [];
  }
});

export const getVendorBySlug = cache(
  async (slug: string): Promise<PublicVendor | null> => {
    try {
      const response = await directus.request(
        readUsers({
          fields: [
            "id",
            "email",
            "first_name",
            "last_name",
            "shop_name",
            "avatar",
            "featured_vendor",
          ],
          filter: {
            id: { _eq: slug },
          },
        })
      );

      const user = response[0] as DirectusUserRaw | undefined;
      if (!user) return null;

      return mapUserToVendor(user);
    } catch (error) {
      console.error(`Error fetching vendor with slug ${slug}:`, error);
      return null;
    }
  },
);