"use client";

import { SearchX, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  activeSearch?: string;
}

export default function EmptyState({ activeSearch }: EmptyStateProps) {
  const requestUrl = activeSearch 
    ? `/contact?type=request&item=${encodeURIComponent(activeSearch)}`
    : "/contact?type=request";

  return (
    <div className="py-20 md:py-32 text-center border border-dashed border-zinc-200 bg-white/50 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-sm mx-auto space-y-8 px-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-full">
            <SearchX className="text-zinc-300" size={20} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-black">
            Inventory Exhausted
          </p>
          <h3 className="text-xl font-bold uppercase tracking-tighter text-zinc-800 italic">
            No matching stock found
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-tight">
            Our sources haven&apos;t listed this specific item yet. Refine your 
            parameters or request a specific acquisition.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/inventory"
            className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-white bg-zinc-900 px-6 py-4 hover:bg-blue-600 transition-all active:scale-95 text-center"
          >
            Clear All Filters
          </Link>
          
          <Link
            href={requestUrl}
            className="group inline-flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors py-2"
          >
            Place a Stock Request 
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}