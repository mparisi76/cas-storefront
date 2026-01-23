/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from "react";
import Link from "next/link";
import { Artifact } from "@/types/product";
import { ImageIcon } from "lucide-react";

export default function ArtifactCard({ item }: { item: Artifact }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSold = item.availability === "sold";

  return (
    <Link
      href={`/inventory/${item.id}`}
      className={`group bg-white border-r border-b border-zinc-200 p-6 md:p-10 transition-all ${
        isSold ? "opacity-90" : "hover:bg-zinc-50/50"
      }`}
    >
      <div className="aspect-4/5 bg-zinc-100 overflow-hidden mb-6 md:mb-8 relative">
        
        {/* SKELETON LAYER (z-0) */}
        {!isLoaded && item.thumbnail && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-0">
            <div className="animate-pulse flex flex-col items-center">
              <ImageIcon className="text-zinc-400 mb-2" size={24} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Retrieving
              </span>
            </div>
          </div>
        )}

        {isSold && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#F9F8F6]/40 backdrop-blur-[1px]">
            <div className="border-2 border-zinc-800 px-4 py-1 text-zinc-800 font-black uppercase tracking-[0.3em] -rotate-12 text-xs shadow-sm bg-white">
              Sold
            </div>
          </div>
        )}

        {item.thumbnail ? (
          <img
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}?width=800&height=1000&fit=inside`}
            alt={item.name}
            onLoad={() => setIsLoaded(true)}
            // REF CALLBACK: This is the secret. It checks the cache during the render 
            // process and updates state safely once the element exists in the DOM.
            ref={(img) => {
              if (img && img.complete && !isLoaded) {
                setIsLoaded(true);
              }
            }}
            className={`relative z-10 object-contain w-full h-full bg-white transition-all duration-700 ease-in-out ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            } ${
              isSold ? "grayscale contrast-75" : "grayscale group-hover:grayscale-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.2em] text-[11px] font-bold">
            Image Pending
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">
            CAS—{String(item.id).padStart(4, "0")}
          </p>
          <h3 className={`font-bold uppercase text-base md:text-lg leading-tight transition-colors tracking-tight ${
              isSold ? "text-zinc-500" : "text-zinc-600 group-hover:text-blue-600"
            }`}>
            {item.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className={`${isSold ? "text-zinc-400 font-mono text-[10px] italic" : "text-blue-600 font-medium text-sm md:text-base"}`}>
            {isSold ? "[ SOLD ]" : item.purchase_price ? `$${Number(item.purchase_price).toLocaleString()}` : "POA"}
          </span>
        </div>
      </div>
    </Link>
  );
}