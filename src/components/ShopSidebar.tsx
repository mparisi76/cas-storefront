"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TreeChild, TreeParent } from "@/types/category";

type CategoryTree = Record<string, TreeParent>;

export default function ShopSidebar({ tree }: { tree: CategoryTree }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") || "all";

  // 1. Initialize state with a function (lazy initialization)
  // This runs once and calculates which parent should be open based on the URL
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(
    () => {
      const initialExpanded: Record<string, boolean> = {};

      Object.entries(tree).forEach(([id, parent]) => {
        const isParent = parent.slug === activeSlug;
        const hasChild = Object.values(parent.children).some(
          (child) => child.slug === activeSlug,
        );

        if (isParent || hasChild) {
          initialExpanded[id] = true;
        }
      });

      return initialExpanded;
    },
  );

  // State to track expanded parent categories
  // const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggerring the category filter
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setCategory = (slug: string, id?: string) => {
    // 1. If we are already on this category, don't push again
    if (activeSlug === slug && window.location.pathname === "/inventory") {
      if (id) setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    if (id) {
      setExpandedIds((prev) => ({ ...prev, [id]: true }));
    }

    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-32 pr-8 self-start">
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-10">
          Inventory
        </h3>

        <nav className="space-y-1">
          <button
            onClick={() => setCategory("all")}
            className={`flex justify-between w-full mb-6 text-[11px] uppercase tracking-widest cursor-pointer ${
              activeSlug === "all"
                ? "text-blue-600 font-black"
                : "text-zinc-500"
            }`}
          >
            <span>All Collections</span>
          </button>

          {Object.entries(tree).map(([id, parent]: [string, TreeParent]) => {
            const isExpanded = expandedIds[id];
            const hasChildren = Object.keys(parent.children).length > 0;

            return (
              <div key={id} className="space-y-2">
                {/* Parent Row */}
                <div className="flex items-center justify-between group">
                  <button
                    onClick={() => setCategory(parent.slug, id)}
                    className={`text-[11px] uppercase tracking-widest font-black cursor-pointer text-left transition-colors ${
                      activeSlug === parent.slug
                        ? "text-blue-600"
                        : "text-zinc-800 hover:text-blue-600"
                    }`}
                  >
                    {parent.name}
                    <span className="ml-2 text-[9px] font-medium text-zinc-600 group-hover:text-blue-400 transition-colors">
                      ({parent.totalCount})
                    </span>
                  </button>

                  {hasChildren && (
                    <button
                      onClick={(e) => toggleExpand(id, e)}
                      className="p-1 hover:bg-zinc-200 rounded transition-colors cursor-pointer text-zinc-600"
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Collapsible Child Section */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100 mt-4 mb-4"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-3 pl-4 border-l border-zinc-200">
                      {Object.entries(parent.children).map(
                        ([childId, child]: [string, TreeChild]) => (
                          <button
                            key={childId}
                            onClick={() => setCategory(child.slug)}
                            className={`flex justify-between items-center w-full text-left text-[10px] uppercase tracking-wider cursor-pointer transition-colors ${
                              activeSlug === child.slug
                                ? "text-blue-600 font-black"
                                : "text-zinc-500 hover:text-zinc-600"
                            }`}
                          >
                            <span>{child.name}</span>
                            <span className="opacity-80 font-mono text-[9px]">
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
      </div>
    </aside>
  );
}
