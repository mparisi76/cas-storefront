import directus from "@/lib/directus";
import { aggregate, readItems } from "@directus/sdk";
import { Category } from "@/types/category";
import { cache } from "react";

// Define exactly what the database is returning
interface CategoryCountResult {
  category: string | null;
  count: string | number;
}

export const getCategoryCounts = cache(
  async (): Promise<Record<string, number>> => {
    const response = await directus.request(
      aggregate("props", {
        aggregate: { count: "*" },
        groupBy: ["category"],
        query: {
          filter: {
            _and: [
              { status: { _eq: "published" } },
              { availability: { _in: ["available", "sold"] } },
            ],
          },
        },
      }),
    );

    const counts: Record<string, number> = {};

    // Cast the response to our specific result interface instead of 'any'
    const results = response as unknown as CategoryCountResult[];

    if (Array.isArray(results)) {
      results.forEach((item) => {
        if (item.category) {
          counts[item.category] = Number(item.count);
        }
      });
    }

    return counts;
  },
);

export const getCategories = cache(async (): Promise<Category[]> => {
  return await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "slug"] }],
      limit: -1,
    }),
  );
});
