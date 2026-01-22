"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent?: string | null;
}

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Logic to find selected category and its parent name
  const selectedCategory = categories.find((c) => String(c.id) === String(value));
  const parentOfSelected = selectedCategory 
    ? categories.find((c) => String(c.id) === String(selectedCategory.parent)) 
    : null;

  const parents = categories.filter((c) => !c.parent);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 text-xs uppercase tracking-widest hover:border-zinc-900 transition-colors focus:outline-none"
      >
        <span className={selectedCategory ? "text-zinc-900 font-medium" : "text-zinc-400"}>
          {selectedCategory ? (
            <>
              {selectedCategory.name}
              {parentOfSelected && (
                <span className="text-zinc-400 font-normal ml-2 lowercase italic">
                  ({parentOfSelected.name})
                </span>
              )}
            </>
          ) : (
            "Select Category"
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center px-3 border-b border-zinc-100">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              autoFocus
              className="w-full p-3 text-[11px] uppercase tracking-wider focus:outline-none bg-transparent"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-2">
            {parents.map((parent) => {
              const children = categories.filter(
                (c) => String(c.parent) === String(parent.id)
              );

              // 2. Fixed 'any' by using Category type
              const matchesSearch = (cat: Category) => 
                cat.name.toLowerCase().includes(search.toLowerCase());
              
              const filteredChildren = children.filter(matchesSearch);
              const parentMatches = matchesSearch(parent);

              if (!parentMatches && filteredChildren.length === 0) return null;

              return (
                <div key={parent.id} className="mb-2">
                  <div className="px-4 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    {parent.name}
                  </div>
                  {filteredChildren.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        onChange(child.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="w-full flex items-center justify-between px-6 py-2 text-[11px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 group text-left"
                    >
                      {child.name}
                      {String(value) === String(child.id) && (
                        <Check className="w-3 h-3 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}