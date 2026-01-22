// @/components/dashboard/KeepAlive.tsx
"use client";

import { useEffect } from "react";

export function KeepAlive() {
  useEffect(() => {
    // Ping every 15 minutes
    const interval = setInterval(
      async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
            method: "GET",
            headers: {
              // We don't need to manually pass the token here if
              // the cookie is set to 'httpOnly: false' or 'SameSite: Lax'
              // and the browser sends it automatically.
            },
          });
        } catch {
          console.error("KeepAlive heartbeat failed");
        }
      },
      1000 * 60 * 15,
    );

    return () => clearInterval(interval);
  }, []);

  return null;
}
