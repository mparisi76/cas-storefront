import directus from "@/lib/directus";
import { readItems, aggregate } from "@directus/sdk";
import { Artifact } from "@/types/artifact";
import { cache } from "react";

interface CategoryCountResult {
  category: string | null;
  count: string | number;
}

type DirectusFilter = Record<string, unknown>;

// 1. Helper to share filter logic between items and counts
const buildFilters = (params: {
  category?: string;
  classification?: string;
  search?: string;
  vendor?: string; // This will be the User ID
}) => {
  const { category, classification, search, vendor } = params;

  const andFilters: DirectusFilter[] = [
    { status: { _eq: "published" } },
    { availability: { _in: ["available", "sold"] } },
  ];

  // FILTER BY SYSTEM USER ID
  if (vendor && vendor !== "all") {
    andFilters.push({
      user_created: { _eq: vendor }
    });
  }

  // ... rest of your classification/category/search logic
  if (classification && classification !== "all") {
    andFilters.push({ classification: { _eq: classification } });
  }

  if (category && category !== "all") {
    andFilters.push({
      _or: [
        { category: { slug: { _eq: category } } },
        { category: { parent: { slug: { _eq: category } } } },
      ],
    });
  }

  if (search) {
    const searchConditions: DirectusFilter[] = [{ name: { _icontains: search } }];
    if (!isNaN(Number(search)) && search.trim() !== "") {
      searchConditions.push({ id: { _eq: Number(search) } });
    }
    andFilters.push({ _or: searchConditions });
  }

  return { _and: andFilters };
};

// ... existing buildFilters function

export const getShopItems = cache(
  async (params: {
    category?: string;
    classification?: string;
    search?: string;
    vendor?: string; // Ensure this is here
    page?: number;
    limit?: number;
  }) => {
    const { page = 1, limit = 12 } = params;
    const filter = buildFilters(params);

    const data = await directus.request(
      readItems("props", {
        filter,
        fields: [
          "id",
          "name",
          "thumbnail",
          "purchase_price",
          "availability",
          "classification",
          { category: ["id", "slug", "name", { parent: ["id", "slug"] }] },
          { user_created: ["id", "first_name", "last_name"] }, // Relation to system users
        ],
        limit,
        page,
      }),
    );

    const countResponse = await directus.request(
      aggregate("props", {
        aggregate: { count: "*" },
        query: { filter },
      }),
    );

    const totalCount = Number(countResponse[0]?.count || 0);

    return {
      data: data as Artifact[],
      meta: { filter_count: totalCount },
    };
  },
);

export const getCategoryCounts = cache(
  async (params: {
    classification?: string;
    search?: string;
    vendor?: string; // FIX: Add vendor to this type definition
  }): Promise<Record<string, number>> => {
    // 1. Build the filter (ignoring category so sidebar stays full)
    const filter = buildFilters({ ...params, category: undefined });

    const response = await directus.request(
      aggregate("props", {
        aggregate: { count: "*" },
        groupBy: ["category"],
        query: { filter },
      }),
    );

    const counts: Record<string, number> = {};
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