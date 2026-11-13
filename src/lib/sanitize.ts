import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes vendor-authored item descriptions before rendering as HTML.
 * Keeps basic formatting; strips scripts, event handlers, iframes, styles, etc.
 * Plain-text descriptions (from the dashboard textarea) keep their line breaks.
 */
export function sanitizeDescription(raw: string | null | undefined): string {
  if (!raw) return "";

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(raw);
  const html = looksLikeHtml
    ? raw
    : sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} }).replace(/\n/g, "<br />");

  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h3", "h4", "blockquote", "a"],
    allowedAttributes: { a: ["href", "rel", "target"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener noreferrer", target: "_blank" }),
    },
  });
}
