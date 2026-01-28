"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Store } from "lucide-react";
import { PublicVendor } from "@/services/(public)/vendors";

interface VendorFilterProps {
  vendors: PublicVendor[];
}

export function VendorFilter({ vendors }: VendorFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeVendorSlug = searchParams.get("vendor") || "all";
  const activeVendorName = vendors.find(v => v.slug === activeVendorSlug)?.name || "All Shops";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVendorSelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("vendor", slug);
    } else {
      params.delete("vendor");
    }
    params.set("page", "1");
    setIsOpen(false);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border px-4 py-3 transition-all duration-200 bg-white ${
          isOpen ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Store size={12} className={activeVendorSlug !== "all" ? "text-blue-600" : "text-zinc-400"} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 truncate">
            {activeVendorName}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-zinc-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-zinc-900 shadow-xl max-h-60 overflow-y-auto">
          <button
            onClick={() => handleVendorSelect(null)}
            className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors ${
              activeVendorSlug === "all" ? "bg-zinc-50 text-blue-600" : "text-zinc-500"
            }`}
          >
            All Shops
          </button>
          {vendors.map((vendor) => (
            <button
              key={vendor.slug}
              onClick={() => handleVendorSelect(vendor.slug)}
              className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 border-t border-zinc-50 transition-colors ${
                activeVendorSlug === vendor.slug ? "bg-zinc-50 text-blue-600" : "text-zinc-500"
              }`}
            >
              {vendor.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}