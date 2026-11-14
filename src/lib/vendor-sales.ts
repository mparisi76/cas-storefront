import "server-only";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export type VendorSale = {
  id: number;
  name: string;
  dateSold: string | null;
  itemPrice: number; // dollars
  /** Present when the sale is matched to its Stripe checkout */
  order: {
    totalPaid: number;
    shipping: { service: string; amount: number } | null; // null = arranged after purchase
    buyer: { name: string | null; email: string | null; phone: string | null };
    shipTo: string[]; // formatted address lines
    paidAt: string;
  } | null;
  /** Null until the vendor marks it shipped (or if tracking isn't set up in Directus yet) */
  tracking: { carrier: string | null; number: string | null; dateShipped: string | null } | null;
};

export type VendorSalesResult = { sales: VendorSale[]; trackingSupported: boolean };

/**
 * Finds the paid Stripe checkout for each item ID (earliest paid one wins).
 * Scans checkouts created since `sinceSeconds`, capped for safety.
 */
export async function findCheckoutSessions(
  itemIds: (string | number)[],
  sinceSeconds: number,
): Promise<Map<string, Stripe.Checkout.Session>> {
  const wanted = new Set(itemIds.map(String));
  const sessions = new Map<string, Stripe.Checkout.Session>();
  if (wanted.size === 0) return sessions;
  try {
    let scanned = 0;
    for await (const s of stripe.checkout.sessions.list({ status: "complete", created: { gte: sinceSeconds }, limit: 100 })) {
      if (++scanned > MAX_SESSIONS_SCANNED) break;
      const itemId = s.metadata?.itemId;
      if (!itemId || !wanted.has(itemId) || s.payment_status !== "paid") continue;
      const prev = sessions.get(itemId);
      if (!prev || s.created < prev.created) sessions.set(itemId, s);
    }
  } catch (err) {
    console.error("Stripe checkout lookup failed:", err);
  }
  return sessions;
}

const MAX_SESSIONS_SCANNED = 1000;

function addressLines(ship: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null | undefined) {
  if (!ship) return [];
  const a = ship.address;
  const cityLine = [a?.city, [a?.state, a?.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [ship.name, a?.line1, a?.line2, cityLine].filter((l): l is string => !!l && l.trim() !== "");
}

/**
 * The logged-in vendor's sold items, each matched to its Stripe checkout
 * (buyer, ship-to, shipping paid). Items are read with the vendor's OWN token
 * and an explicit "created by me" filter, so a vendor only ever sees their sales.
 */
export async function getVendorSales(token: string): Promise<VendorSalesResult> {
  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(staticToken(token)).with(rest());

  const items = (await client.request(
    readItems("props", {
      filter: {
        _and: [{ user_created: { _eq: "$CURRENT_USER" } }, { availability: { _eq: "sold" } }],
      },
      fields: ["id", "name", "purchase_price", "date_sold"],
      sort: ["-date_sold", "-id"],
      limit: 500,
    }),
  )) as { id: number; name: string; purchase_price: string | number | null; date_sold: string | null }[];

  if (items.length === 0) return { sales: [], trackingSupported: true };

  // Tracking fields are read separately so the page still works before they
  // exist in Directus (or if the vendor role can't read them yet).
  const tracking = new Map<string, VendorSale["tracking"]>();
  let trackingSupported = false;
  try {
    const rows = (await client.request(
      readItems("props", {
        filter: { id: { _in: items.map((i) => i.id) } },
        fields: ["id", "tracking_carrier", "tracking_number", "date_shipped"],
        limit: items.length,
      }),
    )) as { id: number; tracking_carrier: string | null; tracking_number: string | null; date_shipped: string | null }[];
    for (const r of rows) {
      if (r.date_shipped || r.tracking_number) {
        tracking.set(String(r.id), { carrier: r.tracking_carrier, number: r.tracking_number, dateShipped: r.date_shipped });
      }
    }
    trackingSupported = true;
  } catch {
    trackingSupported = false;
  }

  // Only scan Stripe back to (just before) this vendor's earliest sale.
  const dates = items.map((i) => (i.date_sold ? Date.parse(i.date_sold) : NaN)).filter(Number.isFinite);
  const earliest = dates.length ? Math.min(...dates) : Date.now() - 365 * 24 * 3600 * 1000;
  const since = Math.floor(earliest / 1000) - 2 * 24 * 3600;

  const sessions = await findCheckoutSessions(
    items.map((i) => i.id),
    since,
  );

  const sales = items.map((i) => {
    const s = sessions.get(String(i.id));
    return {
      id: i.id,
      name: i.name,
      dateSold: i.date_sold,
      itemPrice: Number(i.purchase_price) || 0,
      order: s
        ? {
            totalPaid: (s.amount_total ?? 0) / 100,
            shipping:
              s.metadata?.shipping === "parcel"
                ? { service: s.metadata.shippingService || "Shipping", amount: (s.shipping_cost?.amount_total ?? 0) / 100 }
                : null,
            buyer: {
              name: s.customer_details?.name ?? null,
              email: s.customer_details?.email ?? null,
              phone: s.customer_details?.phone ?? null,
            },
            shipTo: addressLines(s.collected_information?.shipping_details),
            paidAt: new Date(s.created * 1000).toISOString(),
          }
        : null,
      tracking: tracking.get(String(i.id)) ?? null,
    };
  });

  return { sales, trackingSupported };
}

/**
 * Lightweight count of the vendor's sold items without tracking yet (no Stripe
 * calls). Null if tracking isn't set up in Directus yet.
 */
export async function getAwaitingShipmentCount(token: string): Promise<number | null> {
  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(staticToken(token)).with(rest());
  try {
    const rows = (await client.request(
      readItems("props", {
        filter: { _and: [{ user_created: { _eq: "$CURRENT_USER" } }, { availability: { _eq: "sold" } }] },
        fields: ["id", "tracking_number", "date_shipped"],
        limit: 500,
      }),
    )) as { id: number; tracking_number: string | null; date_shipped: string | null }[];
    return rows.filter((r) => !r.tracking_number && !r.date_shipped).length;
  } catch {
    return null;
  }
}
