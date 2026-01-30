"use client";

import { useEffect, useState } from "react";
import ArtifactCard from "./ArtifactCard";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Artifact } from "@/types/artifact";
import Link from "next/link";

export default function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<Artifact[]>([]);
  const [totalInHistory, setTotalInHistory] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = localStorage.getItem("recently_viewed");
        if (!history) {
          setHasChecked(true);
          return;
        }

        const storedIds = JSON.parse(history) as string[];
        const filteredIds = storedIds.filter((id) => String(id) !== String(currentId));
        
        setTotalInHistory(filteredIds.length);
        const idsToFetch = filteredIds.slice(0, 8);

        if (idsToFetch.length === 0) {
          setHasChecked(true);
          return;
        }

        const response = await directus.request(
          readItems("props", {
            filter: { id: { _in: idsToFetch } },
            fields: [
              "id", "name", "thumbnail", "purchase_price", 
              "availability", "classification", 
              { category: ["name", "slug"] },
              { user_created: ["id", "shop_name"] }
            ],
          })
        );

        const data = response as Artifact[];
        const sorted = data.sort((a, b) => 
          idsToFetch.indexOf(String(a.id)) - idsToFetch.indexOf(String(b.id))
        );

        setItems(sorted);
      } catch (error) {
        console.error("RecentlyViewed Error:", error);
      } finally {
        setHasChecked(true);
      }
    };

    fetchHistory();
  }, [currentId]);

  if (!hasChecked || items.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 pt-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
            Your History
          </h3>
          <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic">
            Recently Viewed
          </h2>
        </div>
        
        {totalInHistory > items.length && (
          <Link
            href="/inventory/history" 
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-600 pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-all"
          >
            View All ({totalInHistory})
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 -ml-px -mt-px">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="border-t border-r border-b border-l border-zinc-200 bg-[#F9F8F6] -ml-px -mt-px overflow-hidden"
          >
            <ArtifactCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}