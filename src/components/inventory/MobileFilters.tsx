"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryTree } from "@/types/category";
import { useSearchParams } from "next/navigation";
import { PublicVendor } from "@/types/vendor";

export default function MobileFilters({
  tree,
  activeSlug,
  vendors,
}: {
  tree: CategoryTree;
  activeSlug: string;
  vendors: PublicVendor[];
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeVendorId = searchParams.get("vendor") || "all";

  const getActiveVendorLabel = () => {
    if (activeVendorId === "all") return "All Shops";
    const vendor = vendors.find((v) => v.id === activeVendorId);
    return vendor ? vendor.shop_name : "Shop";
  };

  const getActiveCategoryLabel = () => {
    if (activeSlug === "all") return "All Categories";
    for (const parentKey in tree) {
      const parent = tree[parentKey];
      if (parent.slug === activeSlug) return parent.name;
      for (const childKey in parent.children) {
        if (parent.children[childKey].slug === activeSlug)
          return parent.children[childKey].name;
      }
    }
    return "Category";
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(name);
    else params.set(name, value);
    params.set("page", "1");
    return params.toString();
  };

  return (
    <div className="flex w-full border border-zinc-200 bg-white">
      {/* VENDOR SELECTOR */}
      <div className="flex-1 relative border-r border-zinc-100">
        <button
          onClick={() => {
            setIsVendorOpen(!isVendorOpen);
            setIsCategoryOpen(false);
          }}
          className="w-full flex justify-between items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-800"
        >
          <span className="truncate">{getActiveVendorLabel()}</span>
          {isVendorOpen ? (
            <ChevronUp size={12} className="text-blue-600" />
          ) : (
            <ChevronDown size={12} />
          )}
        </button>

        {isVendorOpen && (
          <div className="absolute top-full -left-1px w-[calc(100%+1px)] bg-white border border-zinc-200 shadow-2xl z-50 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-1">
            <Link
              href={`/inventory?${createQueryString("vendor", "all")}`}
              onClick={() => setIsVendorOpen(false)}
              className={`block px-5 py-4 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-100 ${activeVendorId === "all" ? "text-blue-600 bg-blue-50/30" : "text-zinc-500"}`}
            >
              All Shops
            </Link>
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/inventory?${createQueryString("vendor", vendor.id)}`}
                onClick={() => setIsVendorOpen(false)}
                className={`block px-5 py-4 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-100 ${activeVendorId === vendor.id ? "text-blue-600 bg-blue-50/30" : "text-zinc-500"}`}
              >
                {vendor.shop_name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="flex-1 relative">
        <button
          onClick={() => {
            setIsCategoryOpen(!isCategoryOpen);
            setIsVendorOpen(false);
          }}
          className="w-full flex justify-between items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-800"
        >
          <span className="truncate">{getActiveCategoryLabel()}</span>
          {isCategoryOpen ? (
            <ChevronUp size={12} className="text-blue-600" />
          ) : (
            <ChevronDown size={12} />
          )}
        </button>

        {isCategoryOpen && (
          <div className="absolute top-full -left-px w-[calc(100%+1px)] bg-white border border-zinc-200 shadow-2xl z-50 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-1">
            <Link
              href={`/inventory?${createQueryString("category", "all")}`}
              onClick={() => setIsCategoryOpen(false)}
              className={`block px-5 py-4 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-100 ${activeSlug === "all" ? "text-blue-600 bg-blue-50/30" : "text-zinc-500"}`}
            >
              All Categories
            </Link>
            {Object.entries(tree).map(([id, parent]) => (
              <div key={id} className="border-b border-zinc-100">
                <Link
                  href={`/inventory?${createQueryString("category", parent.slug)}`}
                  onClick={() => setIsCategoryOpen(false)}
                  className={`block px-5 py-4 text-[10px] font-black uppercase tracking-widest ${activeSlug === parent.slug ? "text-blue-600" : "text-zinc-800"}`}
                >
                  {parent.name}
                </Link>
                {Object.entries(parent.children).map(([childId, child]) => (
                  <Link
                    key={childId}
                    href={`/inventory?${createQueryString("category", child.slug)}`}
                    onClick={() => setIsCategoryOpen(false)}
                    className={`block px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-zinc-50/50 ${activeSlug === child.slug ? "text-blue-600" : "text-zinc-500"}`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
