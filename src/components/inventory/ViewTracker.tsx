"use client";

import { useEffect } from "react";

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const raw = localStorage.getItem("recently_viewed");
    let items: string[] = raw ? JSON.parse(raw) : [];

    // Remove the ID if it already exists in the array
    // This allows us to re-insert it at the top (index 0)
    items = items.filter((itemId) => itemId !== id);
    
    // Add the current item to the beginning of the list
    items.unshift(id);

    // Save the full list to localStorage without restriction
    localStorage.setItem("recently_viewed", JSON.stringify(items));
  }, [id]);

  return null;
}