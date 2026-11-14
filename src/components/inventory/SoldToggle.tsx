"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { setHideSoldPreference } from "@/lib/client/sold-preference";

/** "Hide sold items" switch for the catalog. Stored in the URL as ?sold=hide. */
export function SoldToggle({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hidden = searchParams.get("sold") === "hide";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    // Explicit "off" in the URL so the saved preference doesn't re-apply it.
    if (hidden) params.set("sold", "show");
    else params.set("sold", "hide");
    setHideSoldPreference(!hidden);
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={hidden}
      onClick={toggle}
      className={`flex items-center gap-3 text-detail font-black uppercase tracking-widest text-zinc-700 hover:text-zinc-900 ${className}`}
    >
      {/* Track: the thumb sits left (off) or right (on), vertically centered by flexbox */}
      <span
        aria-hidden="true"
        className={`flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          hidden ? "bg-blue-600 justify-end" : "bg-zinc-300 justify-start"
        }`}
      >
        <span className="block h-3 w-3 rounded-full bg-white shadow-sm" />
      </span>
      Hide sold items
    </button>
  );
}
