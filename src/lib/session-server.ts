import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSessionValid } from "@/lib/directus-auth";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  isAccessTokenFresh,
  refreshSession,
  setSessionCookies,
  type SessionTokens,
} from "@/lib/session";

/**
 * Resolves the current user's session for route handlers that are NOT behind
 * middleware (see middleware.ts for why). Refreshes an expired access token
 * when a refresh token is available.
 *
 * Returns the valid access token (or null), plus `refreshed` tokens that must
 * be written back to the browser via `withSessionCookies`.
 */
export async function resolveSession(): Promise<{
  token: string | null;
  refreshed: SessionTokens | null;
}> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (accessToken && isAccessTokenFresh(accessToken) && (await isSessionValid(accessToken))) {
    return { token: accessToken, refreshed: null };
  }

  if (refreshToken) {
    const result = await refreshSession(refreshToken);
    if (result.ok && (await isSessionValid(result.tokens.access_token))) {
      return { token: result.tokens.access_token, refreshed: result.tokens };
    }
  }

  return { token: null, refreshed: null };
}

/** JSON response that also persists refreshed session cookies, if any. */
export function jsonWithSession(
  refreshed: SessionTokens | null,
  body: unknown,
  init?: ResponseInit,
) {
  const res = NextResponse.json(body, init);
  if (refreshed) setSessionCookies(res.cookies, refreshed);
  return res;
}
