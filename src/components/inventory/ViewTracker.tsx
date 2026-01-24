"use client";

import { useEffect } from "react";

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const raw = localStorage.getItem("recently_viewed");
    let items: string[] = raw ? JSON.parse(raw) : [];

    // Remove if already exists (to move it to the front), then add to start
    items = items.filter((itemId) => itemId !== id);
    items.unshift(id);

    // Keep only the last 6 items
    localStorage.setItem("recently_viewed", JSON.stringify(items.slice(0, 6)));
  }, [id]);

  return null;
}