"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { StatCardButton } from "./stat-card/StatCardButton";

interface StatFiltersProps {
  activeCount: number;
  soldCount: number;
  formattedRevenue: string;
}

export function StatFilters({
  activeCount,
  soldCount,
  formattedRevenue,
}: StatFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("availability");

  const handleFilter = (status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status) {
      params.set("availability", status);
    } else {
      params.delete("availability");
    }

    // Clear pagination when changing filters to prevent 404/Empty states
    params.delete("limit");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
      <StatCardButton
        label="Active Listings"
        value={activeCount}
        filterValue={currentFilter === "available" ? null : "available"}
        isActive={currentFilter === "available"}
        onClick={handleFilter}
      />
      <StatCardButton
        label="Items Sold"
        value={soldCount}
        filterValue={currentFilter === "sold" ? null : "sold"}
        isActive={currentFilter === "sold"}
        onClick={handleFilter}
      />

      {/* Revenue Card: Static display only */}
      <div className="bg-white border border-zinc-200 p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Total Revenue
        </p>
        <p className="text-3xl font-light text-zinc-900 tracking-tighter">
          {formattedRevenue}
        </p>
      </div>
    </section>
  );
}
