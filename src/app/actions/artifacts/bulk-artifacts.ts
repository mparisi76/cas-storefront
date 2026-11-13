"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";

type BulkResult = { success: boolean; error?: string };

const MAX_BULK = 200;

async function getTokenAndIds(ids: unknown) {
  const token = (await cookies()).get("directus_session")?.value;
  if (!token) return { error: "AUTH_EXPIRED" as const };

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > MAX_BULK ||
    !ids.every((id) => typeof id === "string" && /^\d+$/.test(id))
  ) {
    return { error: "INVALID_IDS" as const };
  }
  return { token, ids: ids as string[] };
}

function revalidateListings() {
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
}

export async function bulkUpdateStatusAction(
  ids: string[],
  availability: "available" | "sold",
): Promise<BulkResult> {
  if (availability !== "available" && availability !== "sold") {
    return { success: false, error: "INVALID_STATUS" };
  }
  const ctx = await getTokenAndIds(ids);
  if ("error" in ctx) return { success: false, error: ctx.error };

  const result = await vendorArtifactService.bulkUpdateStatus(ctx.token, ctx.ids, availability);
  if (result.success) revalidateListings();
  return result;
}

export async function bulkDeleteAction(ids: string[]): Promise<BulkResult> {
  const ctx = await getTokenAndIds(ids);
  if ("error" in ctx) return { success: false, error: ctx.error };

  const result = await vendorArtifactService.bulkDelete(ctx.token, ctx.ids);
  if (result.success) revalidateListings();
  return result;
}
