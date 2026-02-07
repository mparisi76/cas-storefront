"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { PublicVendor } from "@/types/vendor";

interface ActiveFiltersProps {
  vendors: PublicVendor[]; // Using any[] here as it's a shared component, logic handles the find
  className?: string;
}

export function ActiveFilters({ vendors, className = "" }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSlug = searchParams.get("category");
  const activeVendorId = searchParams.get("vendor");
  const activeEra = searchParams.get("classification");
  const activeSearch = searchParams.get("search");

  const activeVendor = vendors.find(
    (v) => v.id === activeVendorId || v.slug === activeVendorId,
  );

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  const resetAll = () => router.push("/inventory", { scroll: false });

  const hasFilters =
    activeVendorId ||
    (activeSlug && activeSlug !== "all") ||
    (activeEra && activeEra !== "all") ||
    activeSearch;

  if (!hasFilters) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Reset Icon Button */}
      <button
        onClick={resetAll}
        className="flex items-center justify-center w-7 h-7 bg-white border border-zinc-200 text-zinc-400 hover:text-red-600 transition-colors"
        title="Clear All Filters"
      >
        <Trash2 size={12} />
      </button>

      {/* Vendor Chip */}
      {activeVendor && (
        <button
          onClick={() => clearFilter("vendor")}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
        >
          {activeVendor.shop_name || activeVendor.name} <X size={10} />
        </button>
      )}

      {/* Category Chip */}
      {activeSlug && activeSlug !== "all" && (
        <button
          onClick={() => clearFilter("category")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-900 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors"
        >
          {activeSlug.replace(/-/g, " ")} <X size={10} />
        </button>
      )}

      {/* Era Chip */}
      {activeEra && activeEra !== "all" && (
        <button
          onClick={() => clearFilter("classification")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-900 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors"
        >
          {activeEra} <X size={10} />
        </button>
      )}

      {/* Search Chip */}
      {activeSearch && (
        <button
          onClick={() => clearFilter("search")}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
        >
          &ldquo;{activeSearch}&rdquo; <X size={10} />
        </button>
      )}
    </div>
  );
}
