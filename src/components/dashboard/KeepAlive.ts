// components/dashboard/KeepAlive.tsx
"use client";
import { useEffect } from "react";

export function KeepAlive() {
  useEffect(() => {
    // Ping the session every 10 minutes
    const interval = setInterval(
      () => {
        fetch("/api/refresh-session").catch(() => {});
      },
      1000 * 60 * 10,
    );

    return () => clearInterval(interval);
  }, []);

  return null;
}
