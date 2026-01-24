"use client";

import { useEffect, useState } from "react";
import ArtifactCard from "./ArtifactCard";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Artifact } from "@/types/artifact";

export default function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<Artifact[]>([]);
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
        const idsToFetch = storedIds.filter((id) => String(id) !== String(currentId));

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
              { category: ["name", "slug"] }
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
    <section className="mt-32 pt-16 border-t border-zinc-200">
      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
          Your History
        </h2>
        <h3 className="text-3xl font-bold uppercase tracking-tighter italic text-zinc-800">
          Recently Viewed
        </h3>
      </div>

      {/* CLEAN GRID: No background-color hack here.
          We use a standard gap so empty space is just the page background. */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex">
            <ArtifactCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}