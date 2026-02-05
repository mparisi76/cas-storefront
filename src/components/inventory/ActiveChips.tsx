"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { PublicVendor } from "@/types/vendor";

interface ActiveFiltersProps {
  vendors: PublicVendor[];
  className?: string;
}

export function ActiveFilters({ vendors, className = "" }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSlug = searchParams.get("category");
  const activeVendorId = searchParams.get("vendor");
  const activeEra = searchParams.get("classification");

  const activeVendor = vendors.find((v) => v.id === activeVendorId);

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  const resetAll = () => router.push("/inventory", { scroll: false });

  const activeFilterCount = [
    activeVendorId,
    activeSlug && activeSlug !== "all",
    activeEra && activeEra !== "all"
  ].filter(Boolean).length;

  if (activeFilterCount === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* On mobile, we skip the "Active Filters" H3 and just show a reset icon if multiple are active */}
      {activeFilterCount > 1 && (
        <button
          onClick={resetAll}
          className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors border border-zinc-200 bg-white"
        >
          <RotateCcw size={10} />
        </button>
      )}

      {activeVendor && (
        <button onClick={() => clearFilter("vendor")} className="flex items-center gap-2 px-2 py-1 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest">
          {activeVendor.shop_name} <X size={8} />
        </button>
      )}
      
      {activeSlug && activeSlug !== "all" && (
        <button onClick={() => clearFilter("category")} className="flex items-center gap-2 px-2 py-1 bg-zinc-100 text-zinc-900 text-[8px] font-black uppercase tracking-widest border border-zinc-200">
          {activeSlug.replace("-", " ")} <X size={8} />
        </button>
      )}
    </div>
  );
}