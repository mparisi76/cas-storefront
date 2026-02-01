import directus from "@/lib/directus";
import { PublicVendor } from "@/types/vendor";
import { readItems, readUsers } from "@directus/sdk";
import { cache } from "react";

interface DirectusVendorCollectionRaw {
  id: string;
  name: string;
  shop_name?: string | null;
  slug: string;
  logo?: string | null;
  description?: string | null;
  featured_vendor?: boolean | null;
}

export const getActiveVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    const response = await directus.request(
      readUsers({
        fields: [
          "id",
          "first_name",
          "last_name",
          "shop_name",
          "avatar",
          "featured_vendor",
        ],
        filter: {
          role: { name: { _eq: "Vendor" } },
        },
        // Note: Removed sort from here as SDK types for readUsers often omit it
      }),
    );

    const mappedVendors = response.map((user) => {
      const displayName =
        user.shop_name ||
        `${user.first_name || "Independent"} ${user.last_name || "Vendor"}`.trim();

      return {
        id: user.id,
        shop_name: displayName,
        name: displayName,
        slug: user.id,
        logo: user.avatar
          ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${user.avatar}`
          : null,
        featured_vendor: !!user.featured_vendor,
      };
    });

    // Manually sort by shop_name to avoid SDK type errors
    return mappedVendors.sort((a, b) => a.shop_name.localeCompare(b.shop_name));
  } catch (error) {
    console.error("Error fetching users as vendors:", error);
    return [];
  }
});

/**
 * Fetches only vendors marked as 'featured_vendor'
 */
export const getFeaturedVendors = cache(async (): Promise<PublicVendor[]> => {
  try {
    const response = await directus.request(
      readUsers({
        fields: [
          "id",
          "shop_name",
          "first_name",
          "last_name",
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

    return response.map((user) => ({
      id: user.id,
      shop_name:
        user.shop_name ||
        `${user.first_name || "Independent"} ${user.last_name || ""}`.trim(),
      name:
        user.shop_name ||
        `${user.first_name || "Independent"} ${user.last_name || ""}`.trim(),
      slug: user.id,
      logo: user.avatar
        ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${user.avatar}`
        : null,
      featured_vendor: true,
    }));
  } catch (error) {
    console.error("Error fetching featured vendors:", error);
    return [];
  }
});

export const getVendorBySlug = cache(
  async (slug: string): Promise<PublicVendor | null> => {
    try {
      // If you are using a custom 'vendors' collection for profiles:
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

      const vendor = response[0] as DirectusVendorCollectionRaw;
      if (!vendor) return null;

      return {
        id: vendor.id,
        name: vendor.name,
        shop_name: vendor.shop_name || vendor.name,
        slug: vendor.slug,
        logo: vendor.logo
          ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${vendor.logo}`
          : null,
        featured_vendor: !!vendor.featured_vendor,
      } as PublicVendor;
    } catch (error) {
      console.error(`Error fetching vendor with slug ${slug}:`, error);
      return null;
    }
  },
);
