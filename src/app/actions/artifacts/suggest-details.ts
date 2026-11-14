"use server";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/session";
import { isSessionValid } from "@/lib/directus-auth";
import { getCategories } from "@/services/categories";

// ---------------------------------------------------------------------------
// "Fill with AI" for the new-artifact form: Claude looks at the vendor's photos
// and suggests listing details. Everything is a suggestion the vendor reviews;
// weight and dimensions are visual estimates and are flagged as such in the UI.
// ---------------------------------------------------------------------------

const MAX_PHOTOS = 4;
const NAME_MAX = 60; // matches the name field's limit (IdentityFields maxNameLength)

/** Shorten an over-long title at a word boundary, without trailing punctuation. */
function fitName(name: string): string {
  const clean = name.replace(/\s+/g, " ").trim();
  if (clean.length <= NAME_MAX) return clean;
  const cut = clean.slice(0, NAME_MAX + 1);
  const atSpace = cut.lastIndexOf(" ");
  return (atSpace > 20 ? cut.slice(0, atSpace) : clean.slice(0, NAME_MAX)).replace(/[\s,;:–—-]+$/, "");
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SuggestionSchema = z.object({
  name: z.string().describe(`Concise listing title, ${NAME_MAX} characters or fewer`),
  description: z.string().describe("2-3 short plain-text paragraphs separated by blank lines"),
  category_id: z.number().int().nullable().describe("ID of the best-matching category from the list, or null"),
  classification: z.enum(["antique", "mid-century", "vintage", "modern"]),
  weight_lbs: z.number().describe("Estimated weight of the item itself, in pounds"),
  length_in: z.number().describe("Estimated longest horizontal dimension, in inches"),
  width_in: z.number().describe("Estimated depth / second horizontal dimension, in inches"),
  height_in: z.number().describe("Estimated height, in inches"),
  verify_notes: z.string().describe("One or two sentences telling the vendor what to measure or confirm"),
});

export type ArtifactSuggestion = z.infer<typeof SuggestionSchema>;
export type SuggestResult = { ok: true; suggestion: ArtifactSuggestion } | { ok: false; error: string };

const SYSTEM_PROMPT = `You catalog items for Catskill Architectural Salvage, a Hudson Valley marketplace for antiques, vintage, mid-century pieces, home decor, and architectural salvage. A dealer has uploaded photos of one item they want to list. Draft the listing details from what you can see; the dealer will review and edit everything before publishing.

Title: 60 characters or fewer, short and specific, the way a good dealer would label it (e.g. "Mid-Century Walnut Lowboy Dresser", "Cast Iron Clawfoot Tub Feet, Set of 4"). Name the material, form, and style or era when the photos show them. No marketing words.

Description: two or three short paragraphs of plain text. Describe what is visible: materials, construction, finish, style and era cues, notable details, and honest condition (visible wear, damage, missing parts, patina). You may mention how the piece could be used. Do not invent a maker, provenance, exact date, or history the photos don't show; if something is only likely, say "appears to be" or similar. Never claim the item is in better condition than the photos show.

Era (classification): antique = roughly 100+ years old; mid-century = 1940s-1970s; vintage = roughly 1980s-2000s or retro pieces not clearly mid-century; modern = contemporary. Pick the closest.

Category: choose the single most specific category ID from the provided list that fits the item, or null if none fits.

Shipping estimates: estimate the item's own weight in pounds and its dimensions in inches (length = longest horizontal side, width = depth, height = vertical), from visual cues and typical sizes for this kind of object. Round to whole numbers (one decimal place under 5 lbs or 5 inches). These are only used as a starting point; in verify_notes, tell the dealer which measurements to confirm, and mention anything that may affect shipping (fragile glass, very heavy material, oversized).`;

// Simple per-session limit so the button can't be used to run up the API bill.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const usage = new Map<string, number[]>();
function rateLimited(key: string) {
  const now = Date.now();
  const recent = (usage.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  usage.set(key, recent);
  if (usage.size > 5000) usage.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** Fetch a resized JPEG of an uploaded photo from Directus, as base64. */
async function loadPhoto(fileId: string): Promise<string | null> {
  const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${fileId}?width=1200&height=1200&fit=inside&quality=80&format=jpg`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error(`AI fill: couldn't load photo ${fileId} (HTTP ${res.status})`);
    return null;
  }
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}

export async function suggestArtifactDetailsAction(input: {
  photoIds: string[];
  nameHint?: string;
}): Promise<SuggestResult> {
  // 1. Logged-in vendors only.
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token || !(await isSessionValid(token))) {
    return { ok: false, error: "Your session expired. Please log in again." };
  }
  if (rateLimited(token.slice(-24))) {
    return { ok: false, error: "You've used AI fill a lot in the last hour. Please try again later." };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("AI fill: ANTHROPIC_API_KEY is not set");
    return { ok: false, error: "AI fill isn't set up yet." };
  }

  // 2. Validate and load photos (first few are enough).
  const ids = (Array.isArray(input.photoIds) ? input.photoIds : [])
    .filter((id) => typeof id === "string" && UUID_RE.test(id))
    .slice(0, MAX_PHOTOS);
  if (ids.length === 0) return { ok: false, error: "Add at least one photo first." };

  const photos = (await Promise.all(ids.map(loadPhoto))).filter((p): p is string => !!p);
  if (photos.length === 0) return { ok: false, error: "Couldn't load your photos. Please try again." };

  const categories = await getCategories().catch(() => []);
  const categoryList = categories
    .map((c) => `${c.id}: ${c.parent ? `${categories.find((p) => p.id === c.parent?.id)?.name ?? "?"} > ` : ""}${c.name}`)
    .join("\n");

  const nameHint = typeof input.nameHint === "string" ? input.nameHint.trim().slice(0, 120) : "";

  // 3. Ask Claude for structured listing details.
  const client = new Anthropic();
  try {
    // Claude Haiku 5.5 at low effort: the cheapest option (well under a cent per fill).
    const response = await client.messages.parse({
      model: "claude-haiku-5-5",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "low",
        format: zodOutputFormat(SuggestionSchema),
      },
      messages: [
        {
          role: "user",
          content: [
            ...photos.map((data) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: "image/jpeg" as const, data },
            })),
            {
              type: "text",
              text: `Categories (ID: name):\n${categoryList || "(none available)"}\n\n${
                nameHint ? `The dealer called this item: "${nameHint}".\n\n` : ""
              }Draft the listing details for the item in these photos.`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "AI couldn't describe these photos. Please fill in the details yourself." };
    }
    const suggestion = response.parsed_output;
    if (!suggestion) {
      return { ok: false, error: "AI returned an incomplete answer. Please try again." };
    }

    // The name field allows 60 characters; enforce it even if the model overshoots.
    suggestion.name = fitName(suggestion.name);

    // Only accept a category ID that actually exists.
    if (suggestion.category_id !== null && !categories.some((c) => Number(c.id) === suggestion.category_id)) {
      suggestion.category_id = null;
    }
    return { ok: true, suggestion };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "AI is busy right now. Please try again in a minute." };
    }
    if (err instanceof Anthropic.APIError) {
      console.error(`AI fill: Anthropic API error ${err.status}:`, err.message);
      return { ok: false, error: "AI fill failed. Please try again." };
    }
    console.error("AI fill failed:", err);
    return { ok: false, error: "AI fill failed. Please try again." };
  }
}
