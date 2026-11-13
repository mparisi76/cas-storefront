"use server";

import { revalidatePath } from "next/cache";
import { readUser, updateUser } from "@directus/sdk";
import { getAdminSession } from "@/lib/admin";
import { sendVendorApprovedEmail } from "@/lib/mailer";

export type VendorActionResult =
  | { success: true; warning?: string }
  | { success: false; error: string };

type VendorTarget = {
  id: string;
  role: string | null;
  status: string;
  email: string | null;
  first_name: string | null;
  shop_name: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shared guard + update for every admin vendor action:
 * validates the ID, re-checks admin access on the server, and refuses to
 * touch any account that isn't a Vendor (so admins can't be suspended here).
 */
async function updateVendor(
  userId: string,
  patch: { status?: "active" | "suspended"; featured_vendor?: boolean },
): Promise<{ ok: true; before: VendorTarget } | { ok: false; error: string }> {
  if (!UUID_RE.test(userId)) return { ok: false, error: "Invalid user." };

  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Only admins can do this." };

  const vendorRoleId = process.env.DIRECTUS_VENDOR_ROLE_ID;
  if (!vendorRoleId) return { ok: false, error: "DIRECTUS_VENDOR_ROLE_ID is not configured." };

  try {
    const before = (await session.client.request(
      readUser(userId, { fields: ["id", "role", "status", "email", "first_name", "shop_name"] }),
    )) as VendorTarget;

    if (before.role !== vendorRoleId) {
      return { ok: false, error: "That account isn't a vendor." };
    }

    await session.client.request(updateUser(userId, patch as Record<string, unknown>));

    revalidatePath("/dashboard", "layout"); // admin stats and tabs
    revalidatePath("/inventory"); // storefront vendor lists / featured shops
    return { ok: true, before };
  } catch (err) {
    console.error(`Failed to update vendor ${userId}:`, err);
    return { ok: false, error: "Couldn't update the vendor. Please try again." };
  }
}

/** Approve a new (or previously rejected) applicant and email them. */
export async function approveVendorAction(userId: string): Promise<VendorActionResult> {
  const result = await updateVendor(userId, { status: "active" });
  if (!result.ok) return { success: false, error: result.error };

  const { before } = result;
  if (before.status !== "active" && before.email) {
    try {
      await sendVendorApprovedEmail({
        email: before.email,
        first_name: before.first_name,
        shop_name: before.shop_name,
      });
    } catch (err) {
      // A mail failure must not undo or fail the approval.
      console.error(`Approval email to vendor ${userId} failed:`, err);
      return {
        success: true,
        warning: `Approved, but the notification email to ${before.email} failed. Please let them know directly.`,
      };
    }
  }
  return { success: true };
}

/** Reject an applicant. Suspended rather than deleted, so it can be undone. */
export async function rejectVendorAction(userId: string): Promise<VendorActionResult> {
  const result = await updateVendor(userId, { status: "suspended" });
  return result.ok ? { success: true } : { success: false, error: result.error };
}

/** Block an existing vendor from logging in. */
export async function suspendVendorAction(userId: string): Promise<VendorActionResult> {
  const result = await updateVendor(userId, { status: "suspended" });
  return result.ok ? { success: true } : { success: false, error: result.error };
}

/** Restore a suspended vendor. No "you're approved" email; they were approved before. */
export async function reactivateVendorAction(userId: string): Promise<VendorActionResult> {
  const result = await updateVendor(userId, { status: "active" });
  return result.ok ? { success: true } : { success: false, error: result.error };
}

/** Show or hide a vendor in the storefront's Featured Shops. */
export async function setVendorFeaturedAction(
  userId: string,
  featured: boolean,
): Promise<VendorActionResult> {
  if (typeof featured !== "boolean") return { success: false, error: "Invalid value." };
  const result = await updateVendor(userId, { featured_vendor: featured });
  return result.ok ? { success: true } : { success: false, error: result.error };
}
