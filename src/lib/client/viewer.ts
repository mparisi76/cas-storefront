"use client";

import { useEffect, useState } from "react";
import type { MeResponse } from "@/app/api/me/route";
import type { HeaderUser } from "@/lib/header-user";

// One shared /api/me request for all the components on a page that need to
// know who's viewing (edit button, buyer actions...). Cached briefly.
let cached: { at: number; promise: Promise<HeaderUser | null> } | null = null;
const TTL_MS = 30_000;

function fetchViewer(): Promise<HeaderUser | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.promise;
  const promise = fetch("/api/me", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : { user: null }))
    .then((d) => d.user)
    .catch(() => null);
  cached = { at: Date.now(), promise };
  return promise;
}

/**
 * Who is viewing, relative to an item's owner.
 * `loaded` is false until the check finishes (visitors are the default).
 */
export function useViewer(ownerId?: string | null) {
  const [state, setState] = useState<{ loaded: boolean; user: HeaderUser | null }>({ loaded: false, user: null });

  useEffect(() => {
    let cancelled = false;
    fetchViewer().then((user) => {
      if (!cancelled) setState({ loaded: true, user });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isOwner = !!state.user && !!ownerId && state.user.id === ownerId;
  return { loaded: state.loaded, user: state.user, isOwner, canEdit: isOwner || !!state.user?.isAdmin };
}
