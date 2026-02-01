/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Store } from "lucide-react";
import VerifiedIcon from "@/components/ui/icons/VerifiedIcon";
import { PublicVendor } from "@/types/vendor";

export default function FeaturedShops({
  vendors,
}: {
  vendors: PublicVendor[];
}) {
  if (vendors.length === 0) return null;

  return (
    <section className="py-24 bg-white border-y border-zinc-200">
      <div className="px-4 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-blue-600"></span>
              Verified Sources
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic text-zinc-800">
              The Valley&apos;s <br /> Essential Stockists
            </h3>
          </div>
          <Link
            href="/inventory"
            className="group text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2"
          >
            View All Sources
            <span className="group-hover:translate-x-1 transition-transform">
              —&gt;
            </span>
          </Link>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-10 snap-x no-scrollbar">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/inventory?vendor=${vendor.id}`}
              className="group flex-none w-72 snap-start"
            >
              {/* Logo Container */}
              <div className="aspect-square bg-[#F9F8F6] border border-zinc-100 flex items-center justify-center mb-6 overflow-hidden relative transition-all duration-500 group-hover:border-zinc-300 group-hover:shadow-xl group-hover:shadow-zinc-200/50">
                {vendor.logo ? (
                  <img
                    src={vendor.logo}
                    alt={vendor.shop_name}
                    className="w-full h-full object-contain p-8 grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <Store
                    size={48}
                    strokeWidth={1}
                    className="text-zinc-300 group-hover:text-blue-600 transition-colors"
                  />
                )}

                {/* Subtle Overlays */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <VerifiedIcon className="text-blue-600 w-5 h-5" />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold uppercase text-base tracking-tight text-zinc-800 group-hover:text-blue-600 transition-colors">
                  {vendor.shop_name}
                </h4>
                {vendor.featured_vendor && (
                  <VerifiedIcon className="text-blue-600 w-3.5 h-3.5" />
                )}
              </div>

              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] italic">
                Direct Source — Hudson Valley, NY
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}