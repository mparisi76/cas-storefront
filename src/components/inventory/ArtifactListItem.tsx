/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Artifact } from "@/types/artifact";

export default function ArtifactListItem({ item }: { item: Artifact }) {
  // Use the specific shop_name field from the user record
  const vendorDisplay = item.user_created?.shop_name || "Independent Vendor";

  return (
    <Link
      href={`/inventory/${item.id}`}
      className="flex items-center gap-4 p-3 md:p-4 hover:bg-zinc-50 transition-colors group relative"
    >
      <div className="w-12 h-12 bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200">
        {item.thumbnail && (
          <img
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}`}
            alt={item.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
          />
        )}
      </div>

      <div className="flex-1 flex items-center justify-between min-w-0 gap-8">
        <div className="flex flex-col min-w-0 grow-2">
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
            REF_{item.id.toString().slice(0, 8)}
          </span>
          <h3 className="font-bold text-sm uppercase tracking-tight truncate">
            {item.name}
          </h3>
        </div>

        <div className="hidden lg:flex flex-col w-24 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Class.
          </span>
          <span className="text-[10px] uppercase italic truncate">
            {item.classification || "—"}
          </span>
        </div>

        <div className="hidden md:flex flex-col w-40 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Sold By
          </span>
          <span className="text-[10px] font-bold uppercase truncate tracking-tight">
            {vendorDisplay}
          </span>
        </div>

        <div className="flex flex-col items-end w-20 shrink-0">
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Price
          </span>
          <span className="font-black text-sm">${item.purchase_price}</span>
        </div>
      </div>
    </Link>
  );
}
