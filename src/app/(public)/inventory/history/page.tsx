"use client";

import { useEffect, useState } from "react";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Artifact } from "@/types/artifact";
import Link from "next/link";

export default function HistoryPage() {
  const [items, setItems] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const history = localStorage.getItem("recently_viewed");
      if (!history) {
        setItems([]);
        setLoading(false);
        return;
      }

      const idsToFetch = JSON.parse(history) as string[];

      if (idsToFetch.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await directus.request(
        readItems("props", {
          filter: { id: { _in: idsToFetch } },
          fields: [
            "id", "name", "thumbnail", "purchase_price", 
            "availability", "classification", 
            { category: ["name", "slug"] },
            { user_created: ["id", "first_name", "last_name"] }
          ],
        })
      );

      const data = response as Artifact[];
      const sorted = data.sort((a, b) => 
        idsToFetch.indexOf(String(a.id)) - idsToFetch.indexOf(String(b.id))
      );

      setItems(sorted);
    } catch (error) {
      console.error("History Page Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your browsing history?")) {
      localStorage.removeItem("recently_viewed");
      setItems([]);
    }
  };

  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-10 px-4 md:px-10 text-zinc-900">
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/inventory" 
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
            Your Browsing History
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-200 px-4 py-2 hover:bg-red-500 hover:text-white transition-all self-start md:self-end"
          >
            Clear All History
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400 animate-pulse uppercase tracking-widest text-xs">
          Loading your history...
        </div>
      ) : items.length > 0 ? (
        <div className="pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -ml-px -mt-px">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="border-t border-r border-b border-l border-zinc-200 bg-white -ml-px -mt-px overflow-hidden"
              >
                <ArtifactCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-32 text-center border border-dashed border-zinc-200 bg-white/50">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6">
            You haven&apos;t viewed any artifacts yet.
          </p>
          <Link
            href="/inventory"
            className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-200 px-6 py-3 hover:bg-blue-600 hover:text-white transition-all"
          >
            Start Exploring
          </Link>
        </div>
      )}
    </main>
  );
}