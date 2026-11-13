import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";
import { resolveSession, jsonWithSession } from "@/lib/session-server";
import { loadHeaderUser, type HeaderUser } from "@/lib/header-user";

export const dynamic = "force-dynamic";

export type MeResponse = { user: HeaderUser | null };

/**
 * "Who am I" for the site header on storefront pages, which can't read the
 * httpOnly session cookie themselves. Visitors without a session cookie get an
 * instant answer with no Directus call.
 */
export async function GET() {
  const noStore = { headers: { "Cache-Control": "private, no-store" } };

  const store = await cookies();
  if (!store.get(ACCESS_COOKIE) && !store.get(REFRESH_COOKIE)) {
    return NextResponse.json<MeResponse>({ user: null }, noStore);
  }

  const { token, refreshed } = await resolveSession();
  const user = token ? await loadHeaderUser(token) : null;
  return jsonWithSession(refreshed, { user } satisfies MeResponse, noStore);
}
