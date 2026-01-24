import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Category } from "@/types/category";
import { cache } from "react";

export const getCategories = cache(async (): Promise<Category[]> => {
  return await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "slug"] }],
      limit: -1,
    }),
  );
});
