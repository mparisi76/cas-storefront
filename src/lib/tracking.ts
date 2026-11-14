// Shared by the vendor Sales page (client), the mark-shipped action, and emails.

export const CARRIERS = [
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "other", label: "Other" },
] as const;

export type CarrierValue = (typeof CARRIERS)[number]["value"];

export const isCarrier = (v: unknown): v is CarrierValue => CARRIERS.some((c) => c.value === v);

export const carrierLabel = (v: string | null | undefined) =>
  CARRIERS.find((c) => c.value === v)?.label ?? (v || "Carrier");

/** Public tracking page for a carrier, or null for "other". */
export function trackingUrl(carrier: string | null | undefined, number: string | null | undefined): string | null {
  const n = encodeURIComponent((number ?? "").trim());
  if (!n) return null;
  switch (carrier) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    default:
      return null;
  }
}

/** Light sanity check: letters/digits (spaces and dashes allowed), 6-40 chars. */
export const normalizeTrackingNumber = (raw: string) => raw.replace(/[\s-]+/g, "").toUpperCase();
export const isPlausibleTrackingNumber = (n: string) => /^[A-Z0-9]{6,40}$/.test(n);
