"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MeResponse } from "@/app/api/me/route";

const linkClass =
  "text-blue-600 hover:text-zinc-900 border-b border-blue-600/40 hover:border-zinc-900 transition-colors pb-0.5";

/**
 * "For dealers" call to action. Visitors are sent to the vendor application;
 * logged-in users (already vendors/admins) are sent to their dashboard instead.
 * The page is cached, so login state is checked in the browser via /api/me.
 */
export default function DealerCta() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : { user: null }))
      .then((d) => {
        if (!cancelled) setLoggedIn(!!d.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (loggedIn) {
    return (
      <p>
        <Link href="/dashboard" className={linkClass}>
          Go to your dashboard →
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p>
        <Link href="/register" className={linkClass}>
          Apply to sell with us →
        </Link>
      </p>
      <p className="text-sm text-zinc-500">
        Questions first?{" "}
        <Link href="/contact?type=vendor" className="underline hover:text-zinc-900">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
