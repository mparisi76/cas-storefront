import { NextResponse } from "next/server";
import { FROM_HELLO, SHOP_EMAIL, escapeHtml, sendEmail } from "@/lib/mailer";

const ALLOWED_TYPES = new Set(["general", "request", "shipping", "vendor"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Basic per-IP rate limit -------------------------------------------------
// In-memory, so it's per server instance and resets on deploy. Fine for a single
// container; swap for Redis/Upstash if you scale horizontally.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear(); // crude memory cap
  return recent.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real users never see or fill this field. Pretend success for bots.
  if (str(body.website, 200)) {
    return NextResponse.json({ message: "Transmission Successful" }, { status: 200 });
  }

  const name = str(body.name, 100);
  const email = str(body.email, 254).toLowerCase();
  const message = str(body.message, 5000);
  const rawType = str(body.type, 20);
  const type = ALLOWED_TYPES.has(rawType) ? rawType : "general";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error("CONTACT_API_FAILURE: RESEND_API_KEY is missing");
    return NextResponse.json({ error: "Message could not be sent." }, { status: 500 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  // Strip CR/LF so the name can't inject extra email headers via the subject.
  const subjectName = name.replace(/[\r\n]+/g, " ");

  try {
    await sendEmail({
      from: `CAS Portal <hello@catskillas.com>`,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: `[${type.toUpperCase()}] New Inquiry from ${subjectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 40px; color: #18181b;">
          <h2 style="text-transform: uppercase; letter-spacing: 0.2em; font-style: italic; font-weight: 900; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">
            Acquisition Inquiry
          </h2>
          <p><strong>Sender:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Classification:</strong> ${type}</p>
          <div style="margin-top: 30px; padding: 20px; background-color: #fafafa; border-radius: 4px; font-style: italic;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    // The auto-reply goes to an address the visitor typed in, so it must never
    // echo their message back: otherwise this endpoint becomes a spam relay.
    // Only the (escaped, length-capped) name is included.
    await sendEmail({
      from: FROM_HELLO,
      to: email,
      replyTo: SHOP_EMAIL,
      subject: `Got your request — Catskill Architectural Salvage`,
      html: `
        <div style="font-family: serif; max-width: 600px; padding: 40px; color: #1c1c1c; line-height: 1.8;">
          <h2 style="font-style: italic; font-weight: normal; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
            On the hunt...
          </h2>
          <p style="margin-top: 24px;">Hi ${safeName},</p>
          <p>Thanks for reaching out. I'll personally take a look at what we have in stock and see if I can track down a match for you.</p>
          <p style="margin-top: 30px; font-weight: bold;">Best,<br />The Team @ Catskill Architectural Salvage</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Transmission Successful" }, { status: 200 });
  } catch (error: unknown) {
    console.error("CONTACT_API_FAILURE:", error);
    return NextResponse.json({ error: "Message could not be sent." }, { status: 500 });
  }
}
