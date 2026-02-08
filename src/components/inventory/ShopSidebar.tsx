"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TreeChild, TreeParent } from "@/types/category";
import { VendorFilter } from "./VendorFilter";
import { EraFilter } from "./EraFilter";
import { PublicVendor } from "@/types/vendor";
import { ActiveFilters } from "./ActiveChips";

type CategoryTree = Record<string, TreeParent>;

interface ShopSidebarProps {
  tree: CategoryTree;
  vendors: PublicVendor[];
}

export default function ShopSidebar({ tree, vendors }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") || "all";
  const activeEra = searchParams.get("classification") || "all";

  const eraOptions = ["all", "antique", "mid-century", "vintage", "modern"];

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(
    () => {
      const initialExpanded: Record<string, boolean> = {};
      Object.entries(tree).forEach(([id, parent]) => {
        if (
          parent.slug === activeSlug ||
          Object.values(parent.children).some((c) => c.slug === activeSlug)
        ) {
          initialExpanded[id] = true;
        }
      });
      return initialExpanded;
    },
  );

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setCategory = (slug: string, id?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);

    if (id) setExpandedIds((prev) => ({ ...prev, [id]: true }));
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  // const setEra = (era: string) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   if (era === "all") params.delete("classification");
  //   else params.set("classification", era);
  //   params.set("page", "1");
  //   router.push(`/inventory?${params.toString()}`, { scroll: false });
  // };

  return (
    <aside className="w-64 shrink-0 hidden lg:block overflow-visible">
      <div className="sticky top-10 pr-8 space-y-10">
        <ActiveFilters vendors={vendors} />

        {/* ERA SELECTION */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">
            By Era
          </h3>
          <EraFilter
            activeEra={activeEra}
            options={eraOptions}
          />
        </section>

        {/* VENDOR SELECTION */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">
            By Shop
          </h3>
          <VendorFilter vendors={vendors} />
        </section>

        {/* CATEGORY NAV */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">
            By Category
          </h3>
          <nav className="space-y-0.5">
            <button
              onClick={() => setCategory("all")}
              className={`flex justify-between w-full mb-4 text-[10px] uppercase tracking-widest cursor-pointer transition-colors ${
                activeSlug === "all"
                  ? "text-blue-600 font-black"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <span>All Collections</span>
            </button>

            {Object.entries(tree).map(([id, parent]: [string, TreeParent]) => {
              if (parent.totalCount === 0) return null;
              const isExpanded = expandedIds[id];
              const visibleChildren = Object.entries(parent.children).filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, child]) => child.count > 0,
              );
              const hasChildren = visibleChildren.length > 0;

              return (
                <div key={id} className="mb-2">
                  <div className="flex items-center justify-between group">
                    <button
                      onClick={() => setCategory(parent.slug, id)}
                      className={`text-[10px] uppercase tracking-widest font-black cursor-pointer text-left transition-colors ${
                        activeSlug === parent.slug
                          ? "text-blue-600"
                          : "text-zinc-800 hover:text-blue-600"
                      }`}
                    >
                      {parent.name}
                      <span className="ml-1 text-[9px] font-medium text-zinc-400">
                        ({parent.totalCount})
                      </span>
                    </button>

                    {hasChildren && (
                      <button
                        onClick={(e) => toggleExpand(id, e)}
                        className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-400"
                      >
                        <ChevronRight
                          size={12}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-3 mb-2" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-2 pl-3 border-l border-zinc-200">
                        {visibleChildren.map(
                          ([childId, child]: [string, TreeChild]) => (
                            <button
                              key={childId}
                              onClick={() => setCategory(child.slug)}
                              className={`flex justify-between items-center w-full text-left text-[10px] uppercase tracking-wider cursor-pointer transition-colors ${
                                activeSlug === child.slug
                                  ? "text-blue-600 font-black"
                                  : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              <span>{child.name}</span>
                              <span className="opacity-60 font-mono text-[9px]">
                                [{child.count}]
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </section>
      </div>
    </aside>
  );
}