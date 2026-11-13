import { stripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/directus-admin";
import { readItem, updateItem } from "@directus/sdk";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { sendSaleNotifications, type SaleDetails } from "@/lib/sale-emails";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is missing");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // `completed` fires for every finished checkout; for delayed payment methods
  // the money only lands at `async_payment_succeeded`.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const itemId = session.metadata?.itemId;

    if (session.payment_status !== "paid") {
      return new NextResponse("Awaiting payment", { status: 200 });
    }
    if (!itemId) {
      console.error(`Paid session ${session.id} has no itemId metadata`);
      return new NextResponse("OK", { status: 200 });
    }

    try {
      const client = getAdminClient();
      const item = await client.request(
        readItem("props", itemId, { fields: ["id", "name", "availability"] }),
      );

      if (item.availability === "sold") {
        // Stripe can deliver the same event more than once, so this is usually
        // just a retry. If it's a *different* session, the item was paid for
        // twice and someone needs a refund.
        console.warn(
          `Item ${itemId} already sold; paid session ${session.id} — verify this isn't a double sale.`,
        );
        return new NextResponse("OK", { status: 200 });
      }

      await client.request(
        updateItem("props", itemId, {
          availability: "sold",
          date_sold: new Date().toISOString(),
        }),
      );
      revalidatePath("/inventory");
      revalidatePath(`/inventory/${itemId}`);
      console.log(`Item ${itemId} marked as sold (session ${session.id}).`);

      // Notifications run only after the sale is recorded, and never fail the
      // webhook: a 500 here would make Stripe retry, hit the "already sold"
      // branch above, and the emails still wouldn't go out.
      await notifySale(session, { id: item.id, name: String(item.name ?? "Item") });
    } catch (error) {
      console.error(`Failed to mark item ${itemId} sold:`, error);
      // Non-2xx makes Stripe retry with backoff instead of silently dropping it.
      return new NextResponse("Update failed", { status: 500 });
    }
  }

  return new NextResponse("OK", { status: 200 });
}

/** Gathers buyer + vendor details and emails vendor, admin, and buyer. Never throws. */
async function notifySale(session: Stripe.Checkout.Session, item: { id: string | number; name: string }) {
  try {
    // Vendor lookup needs the service token to read props.user_created and the
    // vendor's email/name. If that permission is missing, admin + buyer still get
    // emailed and the admin email says the vendor wasn't notified.
    let vendor: SaleDetails["vendor"] = null;
    try {
      const row = (await getAdminClient().request(
        readItem("props", item.id, {
          fields: [{ user_created: ["email", "first_name", "last_name", "shop_name"] }],
        }),
      )) as {
        user_created: {
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          shop_name: string | null;
        } | null;
      };
      const u = row.user_created;
      if (u) {
        vendor = {
          email: u.email,
          name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.shop_name || "",
          shop: u.shop_name,
        };
      }
    } catch (err) {
      console.error(`Vendor lookup for sold item ${item.id} failed (check service token permissions):`, err);
    }

    const ship = session.collected_information?.shipping_details ?? null;
    const failed = await sendSaleNotifications({
      item,
      amountPaid: (session.amount_total ?? 0) / 100,
      itemPrice: (session.amount_subtotal ?? 0) / 100,
      shipping:
        session.metadata?.shipping === "parcel"
          ? {
              service: session.metadata.shippingService || "Shipping",
              amount: (session.shipping_cost?.amount_total ?? 0) / 100,
              quotedZip: session.metadata.quoteZip || null,
              zipMismatch:
                !!session.metadata.quoteZip &&
                !!ship?.address?.postal_code &&
                ship.address.postal_code.slice(0, 5) !== session.metadata.quoteZip,
            }
          : null,
      sessionId: session.id,
      buyer: {
        name: session.customer_details?.name ?? ship?.name ?? null,
        email: session.customer_details?.email ?? null,
        phone: session.customer_details?.phone ?? null,
        shipTo: ship
          ? {
              name: ship.name ?? null,
              line1: ship.address?.line1 ?? null,
              line2: ship.address?.line2 ?? null,
              city: ship.address?.city ?? null,
              state: ship.address?.state ?? null,
              postal_code: ship.address?.postal_code ?? null,
              country: ship.address?.country ?? null,
            }
          : null,
      },
      vendor,
    });
    if (failed.length === 0) console.log(`Sale emails sent for item ${item.id}.`);
  } catch (err) {
    console.error(`Sale notifications for item ${item.id} failed:`, err);
  }
}
