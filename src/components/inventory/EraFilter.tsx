"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, History } from "lucide-react";

interface EraFilterProps {
  activeEra: string;
  options: string[];
}

export function EraFilter({ activeEra, options }: EraFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Clean label for the button display
  const activeLabel = activeEra === "all" ? "All Eras" : activeEra.replace(/-/g, " ");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEraSelect = (era: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (era === "all") {
      params.delete("classification");
    } else {
      params.set("classification", era);
    }
    params.set("page", "1");
    setIsOpen(false);
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border px-4 py-3 transition-all duration-200 bg-white ${
          isOpen ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <History
            size={12}
            className={
              activeEra !== "all" ? "text-blue-600" : "text-zinc-400"
            }
          />
          <span className="text-detail font-bold uppercase tracking-widest text-zinc-800 truncate">
            {activeLabel}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-zinc-900 shadow-xl overflow-hidden">
          {options.map((era) => (
            <button
              key={era}
              onClick={() => handleEraSelect(era)}
              className={`w-full text-left px-4 py-3 text-detail font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors border-b last:border-b-0 border-zinc-50 ${
                activeEra === era
                  ? "bg-zinc-50 text-blue-600"
                  : "text-zinc-500"
              }`}
            >
              {era === "all" ? "All Eras" : era.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}