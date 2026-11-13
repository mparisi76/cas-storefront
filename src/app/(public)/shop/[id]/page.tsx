/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store, MessageSquare } from "lucide-react";
import { getVendorBySlug } from "@/services/(public)/vendors";
import { getShopItems, SORT_OPTIONS, isSortKey, type SortKey } from "@/services/(public)/artifacts";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import Pagination from "@/components/inventory/Pagination";
import StarIcon from "@/components/ui/icons/StarIcon";

const PER_PAGE = 24;

type Params = Promise<{ id: string }>;
type Search = Promise<{ sort?: string; page?: string }>;

const location = (v: { city?: string | null; state?: string | null }) =>
  [v.city?.trim(), v.state?.trim()].filter(Boolean).join(", ");

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getVendorBySlug(id);
  if (!vendor) return { title: "Shop not found" };
  const where = location(vendor);
  const description =
    vendor.description?.trim().slice(0, 155) ||
    `Architectural salvage and antiques from ${vendor.shop_name}${where ? ` in ${where}` : ""}.`;
  return {
    title: vendor.shop_name,
    description,
    alternates: { canonical: `/shop/${vendor.id}` },
    openGraph: {
      title: vendor.shop_name,
      description,
      ...(vendor.logo ? { images: [{ url: `${vendor.logo}?width=600` }] } : {}),
    },
  };
}

export default async function ShopPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { sort, page } = await searchParams;

  const vendor = await getVendorBySlug(id);
  if (!vendor) notFound();

  const activeSort: SortKey = isSortKey(sort) ? sort : "featured";
  const currentPage = Math.max(1, Number(page) || 1);

  const { data: items, meta } = await getShopItems({
    vendor: vendor.id,
    sort: activeSort,
    page: currentPage,
    limit: PER_PAGE,
  });
  const total = meta.filter_count;
  const totalPages = Math.ceil(total / PER_PAGE);
  const where = location(vendor);

  const sortHref = (key: SortKey) => (key === "featured" ? `/shop/${vendor.id}` : `/shop/${vendor.id}?sort=${key}`);
  const contactHref = `/contact?type=general&item=${encodeURIComponent(`Question for ${vendor.shop_name}`)}`;

  return (
    <main className="bg-[#F9F8F6] min-h-screen px-4 md:px-10 pb-24 text-zinc-900">
      {/* Shop header */}
      <header className="max-w-6xl mx-auto pt-12 md:pt-16 pb-10 border-b border-zinc-200">
        <Link
          href="/inventory"
          className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors"
        >
          ← Full Catalog
        </Link>

        <div className="mt-8 flex flex-col md:flex-row md:items-start gap-8">
          <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full border border-zinc-200 bg-white overflow-hidden flex items-center justify-center">
            {vendor.logo ? (
              <img
                src={`${vendor.logo}?width=224&height=224&fit=cover`}
                alt={`${vendor.shop_name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store size={32} className="text-zinc-500" strokeWidth={1.25} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {vendor.featured_vendor && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">
                  <StarIcon /> Featured Shop
                </span>
              )}
              {where && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  <MapPin size={12} /> {where}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter italic leading-[0.95] text-zinc-900">
              {vendor.shop_name}
            </h1>
            {vendor.description?.trim() && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 whitespace-pre-line">
                {vendor.description.trim()}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800">
                {total} {total === 1 ? "piece" : "pieces"}
              </span>
              <Link
                href={contactHref}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-blue-600 transition-colors"
              >
                <MessageSquare size={12} /> Contact
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Listings */}
      <section className="max-w-6xl mx-auto pt-8">
        {total > 0 && (
          <div className="flex items-center gap-3 mb-6 overflow-x-auto whitespace-nowrap">
            <span className="text-detail font-bold uppercase tracking-widest text-zinc-500">Sort:</span>
            {(Object.entries(SORT_OPTIONS) as [SortKey, (typeof SORT_OPTIONS)[SortKey]][]).map(([key, opt]) => (
              <Link
                key={key}
                href={sortHref(key)}
                className={`text-label font-black uppercase tracking-wider transition-colors ${
                  activeSort === key ? "text-zinc-900 underline underline-offset-4" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {key === "price_asc" ? "Price ↑" : key === "price_desc" ? "Price ↓" : opt.label}
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-200 bg-white/50">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No pieces listed yet</p>
            <p className="mt-2 text-sm text-zinc-500">Check back soon, or browse the full catalog.</p>
            <Link
              href="/inventory"
              className="inline-block mt-6 bg-zinc-900 text-white px-6 py-3 text-detail font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-zinc-200">
              {items.map((item) => (
                <div key={item.id} className="border-r border-b border-zinc-200 bg-white overflow-hidden">
                  <ArtifactCard item={item} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pt-12">
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
