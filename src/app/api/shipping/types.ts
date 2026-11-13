export interface ShippingRate {
  provider: string;
  service: string;
  price: number; // dollars, including handling
  estimatedDays: number | null;
  token: string; // signed quote, sent to checkout
}

export type ShippingQuoteResponse =
  | { mode: "parcel"; rates: ShippingRate[] }
  | { mode: "freight"; reason: "too_heavy" | "missing_dimensions" | "no_origin" };
