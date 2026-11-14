"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createDirectus, rest, staticToken, readItems, readMe, updateItem } from "@directus/sdk";
import { ACCESS_COOKIE } from "@/lib/session";
import { isSessionValid } from "@/lib/directus-auth";
import { findCheckoutSessions } from "@/lib/vendor-sales";
import { sendShippedEmails } from "@/lib/sale-emails";
import {
  carrierLabel,
  isCarrier,
  isPlausibleTrackingNumber,
  normalizeTrackingNumber,
  trackingUrl,
} from "@/lib/tracking";

export type MarkShippedResult = { success: true; warning?: string } | { success: false; error: string };

/**
 * Vendor marks one of their sold items as shipped (or corrects the tracking).
 * Saves carrier/number/date with the vendor's own token, then emails the buyer.
 */
export async function markShippedAction(
  itemId: string,
  carrier: string,
  rawTrackingNumber: string,
): Promise<MarkShippedResult> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token || !(await isSessionValid(token))) {
    return { success: false, error: "Your session expired. Please log in again." };
  }
  if (!/^\d+$/.test(String(itemId))) return { success: false, error: "Invalid item." };
  if (!isCarrier(carrier)) return { success: false, error: "Please choose a carrier." };

  const trackingNumber = normalizeTrackingNumber(String(rawTrackingNumber ?? ""));
  if (!isPlausibleTrackingNumber(trackingNumber)) {
    return { success: false, error: "That doesn't look like a tracking number. Please check it." };
  }

  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(staticToken(token)).with(rest());

  // Only the vendor's own sold items.
  let item: {
    id: number;
    name: string;
    date_sold: string | null;
    tracking_number: string | null;
    tracking_carrier: string | null;
    date_shipped: string | null;
  } | null = null;
  try {
    const rows = (await client.request(
      readItems("props", {
        filter: {
          _and: [
            { id: { _eq: Number(itemId) } },
            { user_created: { _eq: "$CURRENT_USER" } },
            { availability: { _eq: "sold" } },
          ],
        },
        fields: ["id", "name", "date_sold", "tracking_number", "tracking_carrier", "date_shipped"],
        limit: 1,
      }),
    )) as NonNullable<typeof item>[];
    item = rows[0] ?? null;
  } catch (err) {
    console.error(`Mark shipped: couldn't read item ${itemId}:`, err);
    return { success: false, error: "Tracking isn't set up yet. Please contact the shop." };
  }
  if (!item) return { success: false, error: "Sale not found." };

  const isUpdate = !!(item.tracking_number || item.date_shipped);
  if (isUpdate && item.tracking_number === trackingNumber && item.tracking_carrier === carrier) {
    return { success: true }; // nothing changed; don't re-email the buyer
  }

  try {
    await client.request(
      updateItem("props", item.id, {
        tracking_carrier: carrier,
        tracking_number: trackingNumber,
        date_shipped: item.date_shipped ?? new Date().toISOString(),
      } as Record<string, unknown>),
    );
  } catch (err) {
    console.error(`Mark shipped: couldn't update item ${itemId}:`, err);
    return { success: false, error: "Couldn't save the tracking. Please try again." };
  }

  revalidatePath("/dashboard"); // Orders tab + "Awaiting Shipment" card
  revalidatePath("/dashboard/admin/sales");

  // Email the buyer (their address lives on the Stripe checkout).
  const sold = item.date_sold ? Date.parse(item.date_sold) : Date.now() - 365 * 24 * 3600 * 1000;
  const sessions = await findCheckoutSessions([item.id], Math.floor(sold / 1000) - 2 * 24 * 3600);
  const session = sessions.get(String(item.id));
  const me = (await client.request(readMe({ fields: ["shop_name"] })).catch(() => null)) as { shop_name?: string | null } | null;

  const failed = await sendShippedEmails({
    item: { id: item.id, name: item.name },
    buyer: { name: session?.customer_details?.name ?? null, email: session?.customer_details?.email ?? null },
    seller: me?.shop_name?.trim() || null,
    carrier: carrierLabel(carrier),
    trackingNumber,
    trackingLink: trackingUrl(carrier, trackingNumber),
    isUpdate,
  });

  if (!session?.customer_details?.email) {
    return { success: true, warning: "Saved, but we couldn't find the buyer's email. Please contact them directly." };
  }
  if (failed.includes("buyer")) {
    return { success: true, warning: "Saved, but the email to the buyer failed. Please send them the tracking number." };
  }
  return { success: true };
}
