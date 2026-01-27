import { createDirectus, rest, staticToken, readItems, deleteItems, updateItems, readMe } from "@directus/sdk";
import { Artifact } from "@/types/artifact";
import { DirectusUser } from "@/types/dashboard";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

// Helper to get an authenticated client
const getClient = (token: string) => 
  createDirectus(BASE_URL).with(staticToken(token)).with(rest());

export const vendorArtifactService = {
  /**
   * Fetch current user profile data
   */
  async getVendorData(token: string): Promise<DirectusUser | null> {
    const client = getClient(token);
    try {
      const result = await client.request(
        readMe({
          fields: ['first_name', 'last_name', 'id']
        })
      );
      return result as DirectusUser;
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      return null;
    }
  },

  /**
   * Fetch only items owned by the user
   */
  async getMyItems(
  token: string, 
  sort?: string, 
  search?: string, 
  limit: number = 20, 
  page: number = 1
): Promise<Artifact[]> {
    const client = getClient(token);
    try {
      const data = await client.request(
        readItems("props", {
          fields: ["id", "name", "availability", "purchase_price", "date_created"],
          filter: { status: { _eq: "published" } },
          sort: sort ? [sort] : ["-date_created"],
          search: search || undefined,
          limit: limit,
          offset: (page - 1) * limit,
        })
      );
      return data as Artifact[];
    } catch (error) {
      console.error("Fetch Items Error:", error);
      return [];
    }
},

  /**
   * Delete multiple items at once
   */
  async bulkDelete(token: string, ids: string[]) {
    const client = getClient(token);
    try {
      await client.request(deleteItems("props", ids));
      return { success: true };
    } catch (error) {
      console.error("Bulk Delete Error:", error);
      return { success: false };
    }
  },

  /**
   * Bulk update status (e.g., set to 'sold' or 'available')
   */
  async bulkUpdateStatus(token: string, ids: string[], availability: "available" | "sold") {
    const client = getClient(token);
    try {
      await client.request(updateItems("props", ids, { availability }));
      return { success: true };
    } catch (error) {
      console.error("Bulk Update Error:", error);
      return { success: false };
    }
  }
};