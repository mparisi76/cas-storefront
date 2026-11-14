// Shared by the artifact forms (instant feedback) and the create/update actions
// (enforcement), so the rule can't drift between client and server.
// Keep in sync with FREIGHT_THRESHOLD_LBS in lib/shipping.ts.
export const FREIGHT_LBS = 100;

type Specs = { weight?: unknown; length?: unknown; width?: unknown; height?: unknown };
const positive = (v: unknown) => {
  const n = Number(v);
  return v !== "" && v !== null && v !== undefined && Number.isFinite(n) && n > 0;
};

/**
 * Weight is always required. Dimensions are required unless the piece is over
 * the freight threshold (freight is quoted manually, so size isn't needed for rates).
 * Returns a message to show, or null if the specs are complete.
 */
export function shippingSpecsError(specs: Specs): string | null {
  if (!positive(specs.weight)) return "Weight is required so buyers can get shipping rates.";
  if (Number(specs.weight) > FREIGHT_LBS) return null;
  if (![specs.length, specs.width, specs.height].every(positive)) {
    return `Length, width, and height are required for items ${FREIGHT_LBS} lbs or under.`;
  }
  return null;
}
