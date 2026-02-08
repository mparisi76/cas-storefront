/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Artifact } from "@/types/artifact";
import { ImageIcon, AlertCircle, Store, Info } from "lucide-react";
import FeaturedBadge from "@/components/inventory/FeaturedBadge";

interface ArtifactCardProps {
  item: Artifact;
  hideVendor?: boolean;
}

export default function ArtifactCard({
  item,
  hideVendor = false,
}: ArtifactCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isSold = item.availability === "sold";
  const isExternal = Boolean(item.source_url);

  // Check if price exists and is greater than 0
  const hasPrice = item.purchase_price && Number(item.purchase_price) > 0;

  useEffect(() => {
    if (imgRef.current?.complete) {
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }
  }, [item.thumbnail]);

  const imageUrl = item.thumbnail
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}?width=800&height=1000&fit=inside&format=webp`
    : null;

  const vendorName = item.user_created
    ? `${item.user_created.shop_name || ""}`.trim()
    : "Unnamed Shop";

  return (
    <Link
      href={`/inventory/${item.id}`}
      className={`group flex flex-col p-6 md:p-6 transition-all duration-500 ease-out h-full ${
        isSold ? "opacity-90 cursor-default" : "hover:bg-zinc-50/80"
      }`}
    >
      {/* IMAGE CONTAINER */}
      <div className="aspect-4/5 bg-zinc-100 overflow-hidden mb-6 md:mb-8 relative shrink-0">
        {item.featured && !isSold && <FeaturedBadge />}

        {/* LOADING STATE */}
        {!isLoaded && !hasError && item.thumbnail && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-20">
            <div className="animate-pulse flex flex-col items-center">
              <ImageIcon
                className="text-zinc-400 mb-2"
                size={24}
                strokeWidth={1}
              />
              <span className="text-detail font-black uppercase tracking-[0.2em] text-zinc-500">
                Retrieving
              </span>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-20">
            <AlertCircle className="text-zinc-300 mb-1" size={20} />
            <span className="text-detail font-bold uppercase tracking-widest text-zinc-400">
              Asset Missing
            </span>
          </div>
        )}

        {/* SOLD OVERLAY */}
        {isSold && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#F9F8F6]/40 backdrop-blur-[1px]">
            <div className="border-2 border-zinc-800 px-4 py-1 text-zinc-800 font-black uppercase tracking-[0.3em] -rotate-12 text-xs shadow-sm bg-white">
              Sold
            </div>
          </div>
        )}

        {/* IMAGE RENDER OR NO-IMAGE FALLBACK */}
        {imageUrl ? (
          <img
            ref={imgRef}
            src={imageUrl}
            alt={item.name}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
            className={`relative z-10 object-contain w-full h-full bg-white transition-all duration-700 ease-in-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${isSold ? "grayscale contrast-75" : "grayscale group-hover:grayscale-0 group-hover:scale-105"}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-300">
            <ImageIcon size={32} strokeWidth={0.5} className="mb-2" />
            <span className="uppercase tracking-[0.2em] text-detail font-bold">
              No Image Available
            </span>
          </div>
        )}
      </div>

      {/* TEXT AREA */}
      <div className="flex-1 flex flex-col relative min-h-25">
        <div className="flex flex-col gap-1 mb-2">
          {!hideVendor && (
            <div className="flex items-center gap-1.5">
              <Store size={10} className="text-zinc-400 shrink-0" />
              <p className="text-detail font-black uppercase tracking-[0.2em] text-zinc-400 italic truncate">
                {vendorName}
              </p>
            </div>
          )}

          {/* AGGREGATE LISTING TAG */}
          {isExternal && (
            <div className="flex items-center gap-1.5">
              <Info size={10} className="text-blue-500 shrink-0" />
              <p className="text-detail font-black uppercase tracking-[0.2em] text-blue-500 italic">
                Third-Party Listing
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start gap-4">
          <h3
            className={`font-bold uppercase text-base md:text-lg leading-[1.1] transition-colors tracking-tight flex-1 ${
              isSold
                ? "text-zinc-500"
                : "text-zinc-800 group-hover:text-blue-600"
            }`}
          >
            {item.name}
          </h3>

          <div className="text-right shrink-0">
            <span
              className={`${isSold ? "text-zinc-400 font-mono text-detail italic" : "text-blue-600 font-medium text-sm md:text-base"}`}
            >
              {isSold
                ? "[ SOLD ]"
                : hasPrice
                  ? `$${Number(item.purchase_price).toLocaleString()}`
                  : "Call"}
            </span>
          </div>
        </div>

        <p className="absolute -bottom-4 -right-4 text-detail font-black uppercase tracking-[0.3em] text-zinc-400 pointer-events-none">
          CAS—{String(item.id).padStart(4, "0")}
        </p>
      </div>
    </Link>
  );
}
