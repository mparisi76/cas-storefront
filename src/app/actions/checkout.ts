"use server";

import { stripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/directus-admin";
import { readItem } from "@directus/sdk";
import { redirect } from "next/navigation";
import { getShippingMode, verifyQuote } from "@/lib/shipping";

export async function createCheckout(formData: FormData) {
  // Only the item ID is accepted from the client. Price, name, and
  // availability are always read from Directus so they can't be tampered with.
  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!/^\d+$/.test(itemId)) {
    throw new Error("Invalid item");
  }

  const item = await getAdminClient()
    .request(
      readItem("props", itemId, {
        fields: ["id", "name", "purchase_price", "availability", "status", "source_url"],
      }),
    )
    .catch(() => null);

  const unitAmount = Math.round(Number(item?.purchase_price) * 100);

  if (
    !item ||
    item.status !== "published" ||
    item.availability !== "available" ||
    item.source_url ||
    !Number.isFinite(unitAmount) ||
    unitAmount <= 0
  ) {
    // Item is sold, unpublished, external, or unpriced: send them back to the listing.
    redirect(`/inventory/${itemId}?unavailable=1`);
  }

  // Parcel-shippable items must carry a signed quote from /api/shipping.
  // Freight items (or items without dimensions) check out without shipping;
  // it's arranged after purchase.
  const ship = await getShippingMode(itemId);
  let shippingOptions: { shipping_rate_data: {
    type: "fixed_amount";
    fixed_amount: { amount: number; currency: "usd" };
    display_name: string;
    delivery_estimate?: { minimum: { unit: "business_day"; value: number }; maximum: { unit: "business_day"; value: number } };
  } }[] | undefined;
  const shippingMeta: Record<string, string> = { shipping: "arranged_after_purchase" };

  if (ship?.mode === "parcel") {
    const quote = verifyQuote(formData.get("shippingQuote"), itemId);
    if (!quote) redirect(`/inventory/${itemId}?shipping=required`);
    shippingOptions = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: quote.amountCents, currency: "usd" },
          display_name: quote.service.slice(0, 100) || "Shipping",
          ...(quote.estimatedDays
            ? {
                delivery_estimate: {
                  minimum: { unit: "business_day" as const, value: quote.estimatedDays },
                  maximum: { unit: "business_day" as const, value: quote.estimatedDays + 2 },
                },
              }
            : {}),
        },
      },
    ];
    shippingMeta.shipping = "parcel";
    shippingMeta.shippingService = quote.service.slice(0, 100);
    shippingMeta.quoteZip = quote.zip;
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_URL is missing");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata: { itemId: String(item.id), ...shippingMeta },
    ...(shippingOptions ? { shipping_options: shippingOptions } : {}),
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: String(item.name) },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    // Physical goods: collect where it's going and how to reach the buyer.
    shipping_address_collection: { allowed_countries: ["US"] },
    phone_number_collection: { enabled: true },
    // Release the item quickly if the buyer abandons checkout.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/inventory/${item.id}`,
  });

  redirect(session.url!);
}
