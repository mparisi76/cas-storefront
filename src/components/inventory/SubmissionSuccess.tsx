"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Artifact } from "@/types/artifact";
import ArtifactCard from "@/components/inventory/ArtifactCard";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

export function SubmissionSuccess() {
  const searchParams = useSearchParams();
  const itemName = searchParams.get("item");

  const [recentItems, setRecentItems] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentArrivals() {
      try {
        // limit=4 to match the RelatedArtifacts grid
        const fields = "id,name,thumbnail,featured,purchase_price,availability,classification,category.id,category.slug,category.name,user_created.id,user_created.shop_name";
        
        const response = await fetch(
          `${DIRECTUS_URL}/items/props?limit=4&sort=-date_created&filter[status][_eq]=published&filter[featured][_eq]=1&fields=${fields}`,
        );
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          setRecentItems(result.data);
        } else {
          // Fallback to limit 4 as well
          const fallbackResponse = await fetch(
            `${DIRECTUS_URL}/items/props?limit=4&sort=-date_created&filter[status][_eq]=published&fields=${fields}`,
          );
          const fallbackResult = await fallbackResponse.json();
          setRecentItems(fallbackResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch yard arrivals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentArrivals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <CheckCircle2 size={32} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter italic text-zinc-900 mb-4 leading-tight">
          We&apos;re on it.
        </h1>
        <p className="text-zinc-500 text-base leading-relaxed max-w-md mx-auto italic">
          Thanks for reaching out{itemName ? ` regarding ${itemName}` : ""}. We&apos;ve got your details and we&apos;ll be
          in touch shortly. In the meantime, feel free to keep scouting.
        </p>
      </div>

      <div className="border-t border-zinc-200 pt-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-detail font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
              Discovery
            </h3>
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic">
              Recent Yard Arrivals
            </h2>
          </div>
          
          <Link
            href="/inventory"
            className="text-detail font-black uppercase tracking-widest text-blue-600 border-b border-blue-600 pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-all"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-zinc-200" size={32} />
          </div>
        ) : (
          /* THE "INVENTORY PAGE" GRID LOGIC */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 -ml-px -mt-px">
            {recentItems.map((item) => (
              <div 
                key={item.id} 
                className="border border-zinc-200 bg-[#F9F8F6] -ml-px -mt-px overflow-hidden"
              >
                <ArtifactCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}