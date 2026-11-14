"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHideSoldPreference } from "@/lib/client/sold-preference";

/**
 * Re-applies a saved "Hide sold items" preference when the catalog is opened
 * without it in the URL (header link, new visit...). Render once per page.
 */
export function SoldPreferenceSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSoldParam = searchParams.has("sold");

  useEffect(() => {
    if (hasSoldParam || !getHideSoldPreference()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sold", "hide");
    router.replace(`/inventory?${params.toString()}`, { scroll: false });
  }, [hasSoldParam, searchParams, router]);

  return null;
}
