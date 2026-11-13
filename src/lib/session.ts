/**
 * Session cookie helpers shared by middleware (edge runtime) and server actions.
 * Must stay free of Node-only imports.
 *
 * We log in to Directus in `json` mode and keep BOTH tokens in our own
 * httpOnly cookies on our domain:
 *   - ACCESS_COOKIE:  short-lived JWT (Directus ACCESS_TOKEN_TTL, default 15m)
 *   - REFRESH_COOKIE: long-lived, rotated on every refresh (REFRESH_TOKEN_TTL, default 7d)
 */
export const ACCESS_COOKIE = "directus_session";
export const REFRESH_COOKIE = "directus_refresh";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // keep in sync with Directus REFRESH_TOKEN_TTL

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export type SessionTokens = { access_token: string; refresh_token: string };

/** Anything with Next's cookie set/delete API (ResponseCookies, RequestCookies, cookies()). */
type CookieJar = {
  set(name: string, value: string, options?: Partial<typeof cookieOptions>): unknown;
  delete(name: string): unknown;
};

export function setSessionCookies(jar: CookieJar, tokens: SessionTokens) {
  jar.set(ACCESS_COOKIE, tokens.access_token, cookieOptions);
  jar.set(REFRESH_COOKIE, tokens.refresh_token, cookieOptions);
}

export function clearSessionCookies(jar: CookieJar) {
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/**
 * True if the JWT's `exp` is more than `skewSeconds` in the future.
 * This only decides *when* to refresh. It is NOT a security check: Directus
 * still verifies the signature on every API call.
 */
export function isAccessTokenFresh(token: string | undefined, skewSeconds = 60): boolean {
  if (!token) return false;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" && exp - skewSeconds > Date.now() / 1000;
  } catch {
    return false;
  }
}

export type RefreshResult =
  | { ok: true; tokens: SessionTokens }
  | { ok: false; reason: "rejected" | "network" };

// Directus rotates the refresh token on every use, so two concurrent requests
// refreshing with the same token would log the user out (the second one gets
// rejected). Share one in-flight/recent result per refresh token.
// Module state is per server process; fine for the single standalone container.
const DEDUPE_MS = 10_000;
const recentRefreshes = new Map<string, { at: number; result: Promise<RefreshResult> }>();

export function refreshSession(refreshToken: string): Promise<RefreshResult> {
  const now = Date.now();
  for (const [key, entry] of recentRefreshes) {
    if (now - entry.at > DEDUPE_MS) recentRefreshes.delete(key);
  }

  const existing = recentRefreshes.get(refreshToken);
  if (existing) return existing.result;

  const result = (async (): Promise<RefreshResult> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
        cache: "no-store",
      });
      if (!res.ok) return { ok: false, reason: "rejected" };
      const { data } = await res.json();
      if (!data?.access_token || !data?.refresh_token) return { ok: false, reason: "rejected" };
      return { ok: true, tokens: { access_token: data.access_token, refresh_token: data.refresh_token } };
    } catch {
      return { ok: false, reason: "network" };
    }
  })();

  recentRefreshes.set(refreshToken, { at: now, result });
  return result;
}
