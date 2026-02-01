/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Artifact } from "@/types/artifact";
import StarIcon from "@/components/ui/icons/StarIcon";

export default function ArtifactListItem({ item }: { item: Artifact }) {
  // Use the specific shop_name field from the user record
  const vendorDisplay = item.user_created?.shop_name || "Independent Vendor";
  const isSold = item.availability === "sold";

  return (
    <Link
      href={`/inventory/${item.id}`}
      className={`flex items-center gap-4 p-3 md:p-4 transition-colors group relative ${
        isSold ? "opacity-70" : "hover:bg-zinc-50"
      }`}
    >
      {/* THUMBNAIL */}
      <div className="w-12 h-12 bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200 relative">
        {item.thumbnail && (
          <img
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}`}
            alt={item.name}
            className={`w-full h-full object-cover transition-all ${
              isSold ? "grayscale" : "grayscale group-hover:grayscale-0"
            }`}
          />
        )}
        {isSold && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <div className="bg-zinc-900 text-white text-[6px] font-black uppercase px-1 py-0.5 -rotate-12">Sold</div>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-between min-w-0 gap-8">
        {/* PRIMARY INFO & FEATURED TAG */}
        <div className="flex flex-col min-w-0 grow-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
              REF_{item.id.toString().slice(0, 8)}
            </span>
            
            {/* Inline Featured Badge - only for non-sold items */}
            {item.featured && !isSold && (
              <span className="flex items-center gap-1 text-[7px] font-black text-blue-600 uppercase tracking-[0.15em] bg-blue-50 px-1.5 py-0.5 border border-blue-100 animate-pulse-slow">
                <StarIcon className="w-2 h-2" /> Featured
              </span>
            )}
          </div>
          <h3 className={`font-bold text-sm uppercase tracking-tight truncate ${isSold ? "text-zinc-400" : "text-zinc-900"}`}>
            {item.name}
          </h3>
        </div>

        {/* CLASSIFICATION */}
        <div className="hidden lg:flex flex-col w-24 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Class.
          </span>
          <span className={`text-[10px] uppercase italic truncate ${isSold ? "text-zinc-400" : "text-zinc-600"}`}>
            {item.classification || "—"}
          </span>
        </div>

        {/* VENDOR */}
        <div className="hidden md:flex flex-col w-40 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Sold By
          </span>
          <span className={`text-[10px] font-bold uppercase truncate tracking-tight ${isSold ? "text-zinc-400" : "text-zinc-800"}`}>
            {vendorDisplay}
          </span>
        </div>

        {/* PRICE */}
        <div className="flex flex-col items-end w-20 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Price
          </span>
          <span className={`font-black text-sm ${isSold ? "text-zinc-400 line-through decoration-1" : "text-zinc-900"}`}>
            {isSold ? `[ SOLD ]` : `$${item.purchase_price}`}
          </span>
        </div>
      </div>
    </Link>
  );
}