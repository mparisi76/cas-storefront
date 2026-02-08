/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Artifact } from "@/types/artifact";
import { Store } from "lucide-react";

interface ArtifactListItemProps {
  item: Artifact;
}

export default function ArtifactListItem({ item }: ArtifactListItemProps) {
  const isSold = item.availability === "sold";
  const hasPrice = item.purchase_price && Number(item.purchase_price) > 0;

  const vendorName = item.user_created
    ? `${item.user_created.shop_name || ""}`.trim()
    : "Unnamed Shop";

  const imageUrl = item.thumbnail
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}?width=400&height=400&fit=cover&format=webp`
    : null;

  return (
    <Link
      href={`/inventory/${item.id}`}
      className={`group flex items-center gap-6 p-4 md:p-6 transition-all duration-300 ${
        isSold ? "opacity-70" : "hover:bg-zinc-50"
      }`}
    >
      {/* THUMBNAIL */}
      <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-100 shrink-0 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className={`object-cover w-full h-full transition-transform duration-500 ${
              isSold ? "grayscale" : "group-hover:scale-110"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Store size={20} strokeWidth={1} />
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-900 text-white px-1">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-ui-detail font-black uppercase tracking-widest text-zinc-400 italic">
                {vendorName}
              </span>
              <span className="text-zinc-200 text-ui-micro">•</span>
              <span className="text-ui-micro font-mono text-zinc-400">
                CAS—{String(item.id).padStart(4, "0")}
              </span>
            </div>
            <h3
              className={`font-bold uppercase text-sm md:text-lg leading-tight truncate ${
                isSold
                  ? "text-zinc-500"
                  : "text-zinc-800 group-hover:text-blue-600"
              }`}
            >
              {item.name}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`${isSold ? "text-zinc-400 font-mono text-ui-detail italic" : "text-blue-600 font-bold text-base"}`}
            >
              {isSold
                ? "[ SOLD ]"
                : hasPrice
                  ? `$${Number(item.purchase_price).toLocaleString()}`
                  : "Price on Request"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
