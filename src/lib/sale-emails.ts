import "server-only";
import { FROM_ORDERS, SHOP_EMAIL, SHOP_NAME, escapeHtml, sendEmail } from "@/lib/mailer";

export type SaleDetails = {
  item: { id: string | number; name: string };
  amountPaid: number; // dollars, total the buyer actually paid
  itemPrice: number; // dollars, before shipping
  /** null when shipping is arranged after purchase (freight / no quote) */
  shipping: { service: string; amount: number; quotedZip: string | null; zipMismatch: boolean } | null;
  sessionId: string;
  buyer: {
    name: string | null;
    email: string | null;
    phone: string | null;
    shipTo: {
      name: string | null;
      line1: string | null;
      line2: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
    } | null;
  };
  /** null if the vendor couldn't be looked up */
  vendor: { email: string | null; name: string; shop: string | null } | null;
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const ref = (id: string | number) => `CAS-${String(id).padStart(4, "0")}`;

function addressLines(shipTo: SaleDetails["buyer"]["shipTo"]): string[] {
  if (!shipTo) return [];
  const cityLine = [shipTo.city, [shipTo.state, shipTo.postal_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [shipTo.name, shipTo.line1, shipTo.line2, cityLine, shipTo.country].filter(
    (l): l is string => !!l && l.trim() !== "",
  );
}

/** Shared HTML shell matching the site's other emails. */
function layout(title: string, body: string) {
  return `
    <div style="font-family: serif; max-width: 600px; padding: 40px; color: #1c1c1c; line-height: 1.7;">
      <h2 style="font-style: italic; font-weight: normal; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
        ${title}
      </h2>
      ${body}
      <p style="margin-top: 30px; font-weight: bold;">The Team @ ${SHOP_NAME}</p>
    </div>`;
}

function itemTable(sale: SaleDetails) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding: 6px 16px 6px 0; color: #71717a; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">${k}</td><td style="padding: 6px 0;">${v}</td></tr>`;
  return `<table style="margin: 20px 0; border-collapse: collapse;">
    ${row("Item", `${escapeHtml(sale.item.name)} <span style="color:#a1a1aa; font-family: monospace;">${ref(sale.item.id)}</span>`)}
    ${row("Item price", usd(sale.itemPrice))}
    ${row("Shipping", sale.shipping ? `${escapeHtml(sale.shipping.service)}: ${usd(sale.shipping.amount)}` : "Arranged after purchase (freight)")}
    ${row("Total paid", `<strong>${usd(sale.amountPaid)}</strong>`)}
  </table>`;
}

function buyerBlock(sale: SaleDetails) {
  const lines = addressLines(sale.buyer.shipTo).map(escapeHtml);
  const contact = [
    sale.buyer.email ? `<a href="mailto:${escapeHtml(sale.buyer.email)}">${escapeHtml(sale.buyer.email)}</a>` : null,
    sale.buyer.phone ? escapeHtml(sale.buyer.phone) : null,
  ].filter(Boolean);
  return `
    <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 3px solid #18181b;">
      <p style="margin: 0 0 6px; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">Ship to</p>
      <p style="margin: 0;">${lines.length ? lines.join("<br/>") : "<em>No shipping address collected. Contact the buyer.</em>"}</p>
      ${contact.length ? `<p style="margin: 12px 0 0;">${contact.join(" · ")}</p>` : ""}
    </div>`;
}

function shippingText(sale: SaleDetails) {
  return sale.shipping
    ? `Shipping paid: ${sale.shipping.service} (${usd(sale.shipping.amount)})`
    : "Shipping: arranged after purchase (freight). Contact the buyer to quote and schedule delivery.";
}

function buyerText(sale: SaleDetails) {
  return [
    "Ship to:",
    ...(addressLines(sale.buyer.shipTo).length ? addressLines(sale.buyer.shipTo) : ["(no shipping address collected)"]),
    sale.buyer.email ? `Email: ${sale.buyer.email}` : "",
    sale.buyer.phone ? `Phone: ${sale.buyer.phone}` : "",
  ].filter(Boolean);
}

async function sendVendorEmail(sale: SaleDetails) {
  if (!sale.vendor?.email) return;
  const greeting = escapeHtml(sale.vendor.name || "there");
  await sendEmail({
    from: FROM_ORDERS,
    to: sale.vendor.email,
    replyTo: sale.buyer.email || SHOP_EMAIL,
    subject: `You made a sale: ${sale.item.name} (${ref(sale.item.id)})`,
    text: [
      `Hi ${sale.vendor.name || "there"},`,
      "",
      `Good news: "${sale.item.name}" (${ref(sale.item.id)}) just sold for ${usd(sale.amountPaid)}.`,
      "It's been marked Sold on the site. Please pack and ship it to the buyer:",
      shippingText(sale),
      "",
      ...buyerText(sale),
      "",
      `Reply to this email to reach the buyer directly. Questions about the order? Contact ${SHOP_EMAIL}.`,
    ].join("\n"),
    html: layout(
      "You made a sale",
      `<p>Hi ${greeting},</p>
       <p>Good news: this item just sold and has been marked <strong>Sold</strong> on the site. Please pack and ship it to the buyer below.</p>
       <p>${sale.shipping
         ? `The buyer paid for <strong>${escapeHtml(sale.shipping.service)}</strong>. Please ship with that service (or faster).`
         : `<strong>Shipping wasn't charged at checkout</strong> (freight item). Contact the buyer to quote and arrange delivery.`}</p>
       ${itemTable(sale)}
       ${buyerBlock(sale)}
       <p>Reply to this email to reach the buyer directly. Questions about the order? Contact <a href="mailto:${SHOP_EMAIL}">${SHOP_EMAIL}</a>.</p>`,
    ),
  });
}

async function sendAdminEmail(sale: SaleDetails) {
  const vendorLine = sale.vendor
    ? `${sale.vendor.shop || sale.vendor.name}${sale.vendor.email ? ` (${sale.vendor.email})` : ""}`
    : "UNKNOWN: vendor lookup failed. Check the item in Directus and contact the vendor manually.";
  await sendEmail({
    from: `CAS Orders <orders@catskillas.com>`,
    to: SHOP_EMAIL,
    replyTo: sale.buyer.email || undefined,
    subject: `[SALE] ${usd(sale.amountPaid)}: ${sale.item.name} (${ref(sale.item.id)})`,
    text: [
      `New sale: ${sale.item.name} (${ref(sale.item.id)}) for ${usd(sale.amountPaid)}.`,
      `Vendor: ${vendorLine}`,
      shippingText(sale),
      sale.shipping?.zipMismatch
        ? `WARNING: shipping was quoted to ZIP ${sale.shipping.quotedZip} but the delivery address is in a different ZIP. Check the shipping cost.`
        : "",
      sale.vendor?.email ? "The vendor has been emailed the shipping details." : "The vendor was NOT emailed.",
      "",
      `Buyer: ${sale.buyer.name || "(no name)"}`,
      ...buyerText(sale),
      "",
      `Stripe session: ${sale.sessionId}`,
    ].join("\n"),
    html: layout(
      "New sale",
      `${itemTable(sale)}
       <p><strong>Vendor:</strong> ${escapeHtml(vendorLine)}<br/>
       ${sale.vendor?.email ? "The vendor has been emailed the shipping details." : `<strong style="color:#dc2626;">The vendor was NOT emailed.</strong>`}</p>
       ${sale.shipping?.zipMismatch
         ? `<p style="color:#dc2626;"><strong>Check shipping:</strong> quoted to ZIP ${escapeHtml(sale.shipping.quotedZip || "?")}, but the delivery address is in a different ZIP. The rate paid may not cover the actual cost.</p>`
         : ""}
       <p><strong>Buyer:</strong> ${escapeHtml(sale.buyer.name || "(no name)")}</p>
       ${buyerBlock(sale)}
       <p style="font-family: monospace; font-size: 12px; color: #a1a1aa;">Stripe session: ${escapeHtml(sale.sessionId)}</p>`,
    ),
  });
}

async function sendBuyerEmail(sale: SaleDetails) {
  if (!sale.buyer.email) return;
  const first = (sale.buyer.name || "").trim().split(/\s+/)[0] || "there";
  const seller = sale.vendor?.shop || sale.vendor?.name || null;
  await sendEmail({
    from: FROM_ORDERS,
    to: sale.buyer.email,
    replyTo: SHOP_EMAIL,
    subject: `Order confirmed: ${sale.item.name} (${ref(sale.item.id)})`,
    text: [
      `Hi ${first},`,
      "",
      `Thank you for your purchase. Your order is confirmed:`,
      `${sale.item.name} (${ref(sale.item.id)}): ${usd(sale.amountPaid)}`,
      seller ? `Sold by: ${seller}` : "",
      "",
      "We're preparing your item and will be in touch about shipping shortly.",
      "Shipping to:",
      ...addressLines(sale.buyer.shipTo),
      "",
      "Questions? Just reply to this email.",
    ]
      .filter((l) => l !== "")
      .join("\n"),
    html: layout(
      "Order confirmed",
      `<p>Hi ${escapeHtml(first)},</p>
       <p>Thank you for your purchase. Your order is confirmed.</p>
       ${itemTable(sale)}
       ${seller ? `<p><strong>Sold by:</strong> ${escapeHtml(seller)}</p>` : ""}
       <p>We're preparing your item and will be in touch about shipping shortly.</p>
       ${addressLines(sale.buyer.shipTo).length ? `<p style="color:#52525b;">Shipping to:<br/>${addressLines(sale.buyer.shipTo).map(escapeHtml).join("<br/>")}</p>` : ""}
       <p>Questions? Just reply to this email.</p>`,
    ),
  });
}

/**
 * Sends vendor, admin, and buyer emails independently. One failing doesn't
 * stop the others. Never throws; returns which ones failed for logging.
 */
export async function sendSaleNotifications(sale: SaleDetails): Promise<string[]> {
  const jobs = { vendor: sendVendorEmail, admin: sendAdminEmail, buyer: sendBuyerEmail };
  const results = await Promise.allSettled(Object.values(jobs).map((fn) => fn(sale)));
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const name = Object.keys(jobs)[i];
      failed.push(name);
      console.error(`Sale email (${name}) failed for item ${sale.item.id}:`, r.reason);
    }
  });
  return failed;
}
