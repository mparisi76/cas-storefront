import "server-only";

/** Inbox that receives admin notifications and replies from customers. */
export const SHOP_EMAIL = "catskillarchitecturalsalvage@gmail.com";
export const SHOP_NAME = "Catskill Architectural Salvage";

/** Sender addresses on the Resend-verified domain. */
export const FROM_ORDERS = `${SHOP_NAME} <orders@catskillas.com>`;
export const FROM_HELLO = `${SHOP_NAME} <hello@catskillas.com>`;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailMessage = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Sends one email through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Throws with Resend's error message on failure so callers can log it.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: msg.from,
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      subject: msg.subject.replace(/[\r\n]+/g, " "),
      html: msg.html,
      ...(msg.text ? { text: msg.text } : {}),
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Resend ${res.status}: ${body?.message ?? res.statusText}`);
  }
}

/** Tells a vendor their application was approved and they can log in. */
export async function sendVendorApprovedEmail(vendor: {
  email: string;
  first_name?: string | null;
  shop_name?: string | null;
}) {
  const loginUrl = `${process.env.NEXT_PUBLIC_URL}/login`;
  const firstName = escapeHtml(vendor.first_name?.trim() || "there");
  const shop = vendor.shop_name?.trim() ? escapeHtml(vendor.shop_name.trim()) : null;

  await sendEmail({
    from: FROM_HELLO,
    to: vendor.email,
    replyTo: SHOP_EMAIL,
    subject: `You're approved: welcome to ${SHOP_NAME}`,
    text: [
      `Hi ${vendor.first_name?.trim() || "there"},`,
      "",
      `Good news: your vendor account${vendor.shop_name ? ` for ${vendor.shop_name}` : ""} has been approved.`,
      "You can now log in and start listing inventory:",
      loginUrl,
      "",
      `If you have any questions, just reply to this email.`,
      "",
      `The Team @ ${SHOP_NAME}`,
    ].join("\n"),
    html: `
      <div style="font-family: serif; max-width: 600px; padding: 40px; color: #1c1c1c; line-height: 1.8;">
        <h2 style="font-style: italic; font-weight: normal; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
          You're approved
        </h2>
        <p style="margin-top: 24px;">Hi ${firstName},</p>
        <p>Good news: your vendor account${shop ? ` for <strong>${shop}</strong>` : ""} has been approved. You can now log in to the vendor portal and start listing inventory.</p>
        <p style="margin: 32px 0;">
          <a href="${loginUrl}" style="background: #18181b; color: #ffffff; padding: 14px 28px; text-decoration: none; font-family: sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase;">
            Log In
          </a>
        </p>
        <p>If you have any questions, just reply to this email.</p>
        <p style="margin-top: 30px; font-weight: bold;">Best,<br />The Team @ ${SHOP_NAME}</p>
      </div>
    `,
  });
}
