"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeepAlive() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // We fetch our internal API route. 
        // No CORS or SameSite issues here because it's the same domain.
        const response = await fetch("/api/auth/heartbeat", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          // If the internal proxy returns 401, the Directus session is dead.
          // Refresh the page to trigger the layout-level redirect to /login.
          router.refresh();
        }
      } catch (error) {
        // We don't refresh on network errors, only on explicit 401s
        console.error("KeepAlive heartbeat failed:", error);
      }
    }, 1000 * 60 * 5); // 5 minutes

    return () => clearInterval(interval);
  }, [router]);

  return null;
}