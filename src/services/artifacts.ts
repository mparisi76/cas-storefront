import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Artifact } from "@/types/product";
import { cache } from "react";

// 1. Define the metadata response interface
interface DirectusResponse {
  data: Artifact[];
  meta: {
    filter_count: number;
  };
}

// 2. Define a base filter type that avoids 'any'
// This represents a Directus filter object structure
type DirectusFilter = Record<string, unknown>;

export const getShopItems = cache(async ({
  category,
  classification,
  search,
  page = 1,
  limit = 12,
}: {
  category?: string;
  classification?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  
  // We initialize the logic with a structure that TypeScript can follow
  const andFilters: DirectusFilter[] = [
    { status: { _eq: "published" } },
    { availability: { _in: ["available", "sold"] } },
  ];

  // Era / Classification filter
  if (classification && classification !== "all") {
    andFilters.push({ classification: { _eq: classification } });
  }

  // Category filter
  if (category && category !== "all") {
    andFilters.push({
      _or: [
        { category: { slug: { _eq: category } } },
        { category: { parent: { slug: { _eq: category } } } },
      ],
    });
  }

  // Search filter
  if (search) {
    andFilters.push({
      _or: [
        { name: { _icontains: search } },
        { id: { _eq: search } },
      ],
    });
  }

  const response = await directus.request(
    readItems("props", {
      filter: {
        _and: andFilters,
      },
      fields: [
        "id",
        "name",
        "thumbnail",
        "purchase_price",
        "availability",
        "classification",
        { category: ["id", "slug", "name", { parent: ["id", "slug"] }] },
      ],
      limit,
      page,
      meta: "filter_count",
    })
  );

	// Defensive check: if it's an array, it means meta failed, so we wrap it.
	if (Array.isArray(response)) {
		return {
			data: response as Artifact[],
			meta: { filter_count: response.length }
		};
	}

  // Safely cast the SDK response
  return (response as unknown) as DirectusResponse;
});