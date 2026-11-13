import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readItem, readUser } from "@directus/sdk";
import directus from "@/lib/directus";
import { getAdminClient } from "@/lib/directus-admin";

// ---------------------------------------------------------------------------
// Pricing rules
// ---------------------------------------------------------------------------
export const FREIGHT_THRESHOLD_LBS = 100; // heavier ships by freight, quoted manually
const HANDLING_FLAT_FEE = 5.0; // packing materials
const MARKUP = 1.15; // 15% buffer for insurance / handling
const QUOTE_TTL_SECONDS = 2 * 60 * 60; // signed quotes are valid for 2 hours
const MAX_RATES = 3;

export type ShipFrom = { name: string; street1: string; city: string; state: string; zip: string };

export type ShippingMode =
  | { mode: "parcel"; item: ShippableItem; origin: ShipFrom }
  | { mode: "freight"; reason: "too_heavy" | "missing_dimensions" | "no_origin" };

type ShippableItem = {
  id: number;
  name: string;
  weight: number;
  length: number;
  width: number;
  height: number;
};

export type QuotedRate = {
  provider: string;
  service: string;
  price: number; // dollars, marked up
  estimatedDays: number | null;
  token: string; // signed; required by checkout
};

// ---------------------------------------------------------------------------
// Ship-from address
// ---------------------------------------------------------------------------

/**
 * Ship-from address of whoever listed the item (a vendor or the admin account),
 * from their Settings profile. Street and ZIP are private, so this reads with
 * the server token (needs Read on directus_users: id, street_address,
 * zip_code, city, state, shop_name, for vendor AND admin users).
 */
async function vendorOrigin(userId: string): Promise<ShipFrom | null> {
  try {
    const u = (await getAdminClient().request(
      readUser(userId, { fields: ["shop_name", "street_address", "city", "state", "zip_code"] }),
    )) as {
      shop_name?: string | null;
      street_address?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
    };
    const zip = (u.zip_code || "").trim().slice(0, 5);
    if (u.street_address && u.city && u.state && /^\d{5}$/.test(zip)) {
      return {
        name: u.shop_name || "Catskill Architectural Salvage vendor",
        street1: u.street_address.trim(),
        city: u.city.trim(),
        state: u.state.trim(),
        zip,
      };
    }
  } catch (err) {
    console.error(`Ship-from lookup for vendor ${userId} failed (check service token permissions):`, err);
  }
  return null;
}

/**
 * Decides how an item ships, using data from Directus (never from the browser).
 * Returns null if the item doesn't exist or isn't purchasable.
 */
export async function getShippingMode(itemId: string): Promise<ShippingMode | null> {
  if (!/^\d+$/.test(itemId)) return null;

  const item = (await directus
    .request(
      readItem("props", itemId, {
        fields: ["id", "name", "status", "availability", "weight", "length", "width", "height", "user_created"],
      }),
    )
    .catch(() => null)) as
    | {
        id: number;
        name: string;
        status: string;
        availability: string;
        weight: unknown;
        length: unknown;
        width: unknown;
        height: unknown;
        user_created: string | { id: string } | null;
      }
    | null;

  if (!item || item.status !== "published" || item.availability !== "available") return null;

  const dims = {
    weight: Number(item.weight),
    length: Number(item.length),
    width: Number(item.width),
    height: Number(item.height),
  };
  if (!Object.values(dims).every((n) => Number.isFinite(n) && n > 0)) {
    return { mode: "freight", reason: "missing_dimensions" };
  }
  if (dims.weight > FREIGHT_THRESHOLD_LBS) return { mode: "freight", reason: "too_heavy" };

  const ownerId = typeof item.user_created === "string" ? item.user_created : item.user_created?.id;
  // No address on the owner's profile: fall back to "shipping arranged after purchase".
  const origin = ownerId ? await vendorOrigin(ownerId) : null;
  if (!origin) return { mode: "freight", reason: "no_origin" };

  return { mode: "parcel", item: { id: item.id, name: item.name, ...dims }, origin };
}

// ---------------------------------------------------------------------------
// Signed quotes: the browser can't change price, service, item, or ZIP.
// ---------------------------------------------------------------------------
type QuotePayload = { i: number; z: string; c: number; s: string; d: number | null; e: number };

function quoteKey() {
  const explicit = process.env.SHIPPING_QUOTE_SECRET;
  if (explicit) return explicit;
  const stripe = process.env.STRIPE_SECRET_KEY;
  if (!stripe) throw new Error("No secret available to sign shipping quotes");
  return createHash("sha256").update(`cas-shipping-quote:${stripe}`).digest("hex");
}

function sign(payload: QuotePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", quoteKey()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export type VerifiedQuote = {
  itemId: number;
  zip: string;
  amountCents: number;
  service: string;
  estimatedDays: number | null;
};

export function verifyQuote(token: unknown, itemId: string): VerifiedQuote | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = createHmac("sha256", quoteKey()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as QuotePayload;
    if (String(p.i) !== itemId || p.e < Date.now() / 1000 || !(p.c > 0)) return null;
    return { itemId: p.i, zip: p.z, amountCents: p.c, service: p.s, estimatedDays: p.d };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shippo
// ---------------------------------------------------------------------------
type ShippoRate = {
  amount: string;
  currency: string;
  provider: string;
  servicelevel?: { name?: string };
  estimated_days?: number | null;
};

export async function quoteRates(
  ship: Extract<ShippingMode, { mode: "parcel" }>,
  zip: string,
): Promise<QuotedRate[]> {
  const apiKey = process.env.SHIPPO_API_KEY;
  if (!apiKey) throw new Error("SHIPPO_API_KEY is missing");

  const res = await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers: { Authorization: `ShippoToken ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      address_from: { ...ship.origin, country: "US" },
      address_to: { zip, country: "US" },
      parcels: [
        {
          length: String(ship.item.length),
          width: String(ship.item.width),
          height: String(ship.item.height),
          distance_unit: "in",
          weight: String(ship.item.weight),
          mass_unit: "lb",
        },
      ],
      async: false,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shippo ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = (await res.json()) as { rates?: ShippoRate[] };
  const exp = Math.floor(Date.now() / 1000) + QUOTE_TTL_SECONDS;

  return (data.rates ?? [])
    .filter((r) => r.currency === "USD" && Number(r.amount) > 0)
    .map((r) => {
      const price = Math.round((Number(r.amount) * MARKUP + HANDLING_FLAT_FEE) * 100) / 100;
      const service = `${r.provider} ${r.servicelevel?.name ?? ""}`.trim();
      const days = typeof r.estimated_days === "number" ? r.estimated_days : null;
      return {
        provider: r.provider,
        service: r.servicelevel?.name ?? "",
        price,
        estimatedDays: days,
        token: sign({ i: ship.item.id, z: zip, c: Math.round(price * 100), s: service, d: days, e: exp }),
      };
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, MAX_RATES);
}
