"use server";

import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import type { Artifact } from "@/types/artifact";

// Browser components used to call Directus directly, which fails because
// Directus doesn't send CORS headers. These run on our server instead.

const CARD_FIELDS = [
  "id",
  "name",
  "thumbnail",
  "featured",
  "purchase_price",
  "availability",
  "classification",
  { category: ["id", "name", "slug"] },
  { user_created: ["id", "first_name", "last_name", "shop_name"] },
] as const;

const MAX_IDS = 50;

/**
 * Published items for the given IDs, returned in the same order as `ids`.
 * IDs come from the visitor's localStorage, so they're validated here.
 */
export async function getArtifactsByIds(ids: unknown): Promise<Artifact[]> {
  if (!Array.isArray(ids)) return [];
  const clean = [...new Set(ids.map(String).filter((id) => /^\d+$/.test(id)))].slice(0, MAX_IDS);
  if (clean.length === 0) return [];

  try {
    const data = (await directus.request(
      readItems("props", {
        filter: { _and: [{ id: { _in: clean } }, { status: { _eq: "published" } }] },
        fields: [...CARD_FIELDS],
        limit: clean.length,
      }),
    )) as Artifact[];
    return data.sort((a, b) => clean.indexOf(String(a.id)) - clean.indexOf(String(b.id)));
  } catch (err) {
    console.error("getArtifactsByIds failed:", err);
    return [];
  }
}

/** Four newest featured items, falling back to the four newest overall. */
export async function getRecentArrivals(): Promise<Artifact[]> {
  const query = (featuredOnly: boolean) =>
    directus.request(
      readItems("props", {
        filter: {
          _and: [
            { status: { _eq: "published" } },
            ...(featuredOnly ? [{ featured: { _eq: true } }] : []),
          ],
        },
        fields: [...CARD_FIELDS],
        sort: ["-date_created"],
        limit: 4,
      }),
    ) as Promise<Artifact[]>;

  try {
    const featured = await query(true);
    return featured.length > 0 ? featured : await query(false);
  } catch (err) {
    console.error("getRecentArrivals failed:", err);
    return [];
  }
}
