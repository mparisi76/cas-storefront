import { NextResponse } from "next/server";
import { getShippingMode, quoteRates } from "@/lib/shipping";
import type { ShippingQuoteResponse } from "./types";

/**
 * POST { itemId, zipCode } -> shipping options for that item.
 * Weight, dimensions, and ship-from address come from Directus, never from the
 * browser, and each rate carries a signed token that checkout verifies.
 */
export async function POST(req: Request) {
  let body: { itemId?: unknown; zipCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const itemId = String(body.itemId ?? "");
  const zip = String(body.zipCode ?? "").trim();
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Please enter a valid 5-digit ZIP code." }, { status: 400 });
  }

  const ship = await getShippingMode(itemId);
  if (!ship) {
    return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });
  }
  if (ship.mode === "freight") {
    return NextResponse.json<ShippingQuoteResponse>({ mode: "freight", reason: ship.reason });
  }

  try {
    const rates = await quoteRates(ship, zip);
    if (rates.length === 0) {
      return NextResponse.json({ error: "No carrier rates found for that ZIP code." }, { status: 404 });
    }
    return NextResponse.json<ShippingQuoteResponse>({ mode: "parcel", rates });
  } catch (error) {
    console.error("Shipping quote failed:", error);
    return NextResponse.json({ error: "Couldn't get shipping rates right now. Please try again." }, { status: 502 });
  }
}
