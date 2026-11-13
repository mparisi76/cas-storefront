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
};

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
export async function getVendorSales(token: string): Promise<VendorSale[]> {
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

  if (items.length === 0) return [];

  // Only scan Stripe back to (just before) this vendor's earliest sale.
  const dates = items.map((i) => (i.date_sold ? Date.parse(i.date_sold) : NaN)).filter(Number.isFinite);
  const earliest = dates.length ? Math.min(...dates) : Date.now() - 365 * 24 * 3600 * 1000;
  const since = Math.floor(earliest / 1000) - 2 * 24 * 3600;

  const wanted = new Set(items.map((i) => String(i.id)));
  const sessions = new Map<string, Stripe.Checkout.Session>();
  try {
    let scanned = 0;
    for await (const s of stripe.checkout.sessions.list({ status: "complete", created: { gte: since }, limit: 100 })) {
      if (++scanned > MAX_SESSIONS_SCANNED) break;
      const itemId = s.metadata?.itemId;
      if (!itemId || !wanted.has(itemId) || s.payment_status !== "paid") continue;
      // Keep the earliest paid checkout per item (the one that actually bought it).
      const prev = sessions.get(itemId);
      if (!prev || s.created < prev.created) sessions.set(itemId, s);
    }
  } catch (err) {
    console.error("Stripe lookup for vendor sales failed:", err);
  }

  return items.map((i) => {
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
    };
  });
}
