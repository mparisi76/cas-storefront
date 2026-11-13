import directus from "@/lib/directus";
import { readItems, readUsers, aggregate } from "@directus/sdk";
import { Artifact } from "@/types/artifact";
import { cache } from "react";

interface CategoryCountResult {
  category: string | null;
  count: string | number;
}

type DirectusFilter = Record<string, unknown>;

/**
 * Validates UUID format (8-4-4-4-12 hex characters)
 * This prevents the app from crashing when malformed vendor IDs are passed in the URL.
 */
const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

// --- Location (from the listing vendor's City/State in Settings) -----------
// Vendors type their town freehand, so matching ignores capitalization.
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const caseVariants = (s: string) => [...new Set([s, s.toLowerCase(), s.toUpperCase(), titleCase(s)])];
export const normalizeState = (s: string | null | undefined) => (s ?? "").trim().toUpperCase();
export const normalizeCity = (s: string | null | undefined) => titleCase((s ?? "").trim());

// 1. Helper to share filter logic between items and counts
const buildFilters = (params: {
  category?: string;
  classification?: string;
  search?: string;
  vendor?: string;
  state?: string;
  city?: string;
}) => {
  const { category, classification, search, vendor } = params;

  const andFilters: DirectusFilter[] = [
    { status: { _eq: "published" } },
    { availability: { _in: ["available", "sold"] } },
  ];

  // VALIDATED VENDOR FILTER
  if (vendor && vendor !== "all") {
    if (isValidUUID(vendor)) {
      andFilters.push({
        user_created: { _eq: vendor }
      });
    } else {
      // If the vendor ID is malformed, we inject a filter that is guaranteed 
      // to return nothing (searching for a non-existent ID) to fail safely.
      andFilters.push({ id: { _eq: -1 } });
    }
  }

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

  const state = normalizeState(params.state);
  if (/^[A-Z]{2}$/.test(state)) {
    andFilters.push({ user_created: { state: { _in: caseVariants(state) } } });
    const city = normalizeCity(params.city);
    if (city) andFilters.push({ user_created: { city: { _in: caseVariants(city) } } });
  }

  return { _and: andFilters };
};

/** Catalog sort options. Only these keys are accepted from the URL. */
export const SORT_OPTIONS = {
  featured: { label: "Featured", sort: ["-featured", "-date_created", "-id"] },
  newest: { label: "Newest", sort: ["-date_created", "-id"] },
  price_asc: { label: "Price: Low to High", sort: ["purchase_price", "-id"] },
  price_desc: { label: "Price: High to Low", sort: ["-purchase_price", "-id"] },
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;
export const isSortKey = (v: unknown): v is SortKey =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(SORT_OPTIONS, v);

export const getShopItems = cache(
  async (params: {
    category?: string;
    classification?: string;
    search?: string;
    vendor?: string;
    state?: string;
    city?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const { page = 1, limit = 12 } = params;
    const sortKey: SortKey = isSortKey(params.sort) ? params.sort : "featured";
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
          "featured",
          "source_url",
          { category: ["id", "slug", "name", { parent: ["id", "slug"] }] },
          { user_created: ["id", "first_name", "last_name", "shop_name", "city", "state"] },
        ],
        sort: [...SORT_OPTIONS[sortKey].sort],
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
    vendor?: string;
    state?: string;
    city?: string;
  }): Promise<Record<string, number>> => {
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

export const getMoreFromVendor = cache(async (vendorId: string, currentArtifactId: string | number) => {
  // Even internal IDs should be validated if they come from the URL/client
  if (!isValidUUID(vendorId)) return [];

  try {
    const data = await directus.request(
      readItems("props", {
        filter: {
          _and: [
            { user_created: { _eq: vendorId } },
            { id: { _neq: currentArtifactId } },
            { status: { _eq: "published" } }
          ],
        },
        limit: 4,
        fields: [
          "id",
          "name",
          "thumbnail",
          "purchase_price",
          "availability",
          "featured",
          { user_created: ["id", "first_name", "last_name", "shop_name"] }
        ],
        sort: ["-featured", "-date_created"],
      })
    );

    return data;
  } catch (error) {
    console.error("Error fetching more from vendor:", error);
    return [];
  }
});
export type LocationOption = { state: string; count: number; cities: { name: string; count: number }[] };

/**
 * Item counts per state and city, respecting every other active filter
 * (but not the location itself, so you can switch between places).
 */
export const getLocationCounts = cache(
  async (params: {
    category?: string;
    classification?: string;
    search?: string;
    vendor?: string;
  }): Promise<LocationOption[]> => {
    try {
      const filter = buildFilters({ ...params, state: undefined, city: undefined });
      const perVendor = (await directus.request(
        aggregate("props", { aggregate: { count: "*" }, groupBy: ["user_created"], query: { filter } }),
      )) as unknown as { user_created: string | null; count: string | number }[];

      const counts = new Map<string, number>();
      for (const row of perVendor) if (row.user_created) counts.set(row.user_created, Number(row.count) || 0);
      if (counts.size === 0) return [];

      const owners = (await directus.request(
        readUsers({ filter: { id: { _in: [...counts.keys()] } }, fields: ["id", "city", "state"], limit: -1 }),
      )) as { id: string; city?: string | null; state?: string | null }[];

      const states = new Map<string, { count: number; cities: Map<string, number> }>();
      for (const o of owners) {
        const state = normalizeState(o.state);
        if (!/^[A-Z]{2}$/.test(state)) continue; // vendors without a location aren't listed
        const n = counts.get(o.id) ?? 0;
        if (!n) continue;
        const entry = states.get(state) ?? { count: 0, cities: new Map<string, number>() };
        entry.count += n;
        const city = normalizeCity(o.city);
        if (city) entry.cities.set(city, (entry.cities.get(city) ?? 0) + n);
        states.set(state, entry);
      }

      return [...states.entries()]
        .map(([state, e]) => ({
          state,
          count: e.count,
          cities: [...e.cities.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
    } catch (error) {
      console.error("Error fetching location counts:", error);
      return [];
    }
  },
);
