// @/components/dashboard/KeepAlive.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeepAlive() {
  const router = useRouter();

  useEffect(() => {
    // 1. Tighten the interval to 5 minutes. 
    // This ensures we hit the server well before a 15-min token expires.
    const interval = setInterval(
      async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
            method: "GET",
            // 2. CRITICAL: This tells the browser to send the 'directus_session' cookie.
            // Without this, Directus doesn't know who is pinging.
            credentials: "include", 
          });

          if (response.status === 401) {
            // 3. If the server says "Unauthorized", the session is already dead.
            // Instead of a broken UI, we force a refresh so DashboardLayout redirects us.
            router.refresh();
          }
        } catch (error) {
          console.error("KeepAlive heartbeat failed:", error);
        }
      },
      1000 * 60 * 5 // 5 minutes
    );

    return () => clearInterval(interval);
  }, [router]);

  return null;
}