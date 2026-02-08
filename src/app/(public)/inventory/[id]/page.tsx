/* eslint-disable @next/next/no-img-element */
import ShippingDrawer from "@/components/inventory/ShippingDrawer";
import ArtifactGallery from "@/components/inventory/ArtifactGallery";
import RelatedArtifacts from "@/components/inventory/RelatedArtifacts";
import directus from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createCheckout } from "@/app/actions/checkout";
import type { Metadata } from "next";
import ViewTracker from "@/components/inventory/ViewTracker";
import RecentlyViewed from "@/components/inventory/RecentlyViewed";
import { Store, ExternalLink, Info, MessageSquare } from "lucide-react";
import MoreFromVendor from "@/components/inventory/MoreFromVendor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await directus.request(
    readItem("props", id, {
      fields: ["name", "description", "thumbnail", "classification"],
    }),
  );

  if (!item) return { title: "Item Not Found" };

  const eraTag = item.classification ? ` | ${item.classification.toUpperCase()}` : "";

  return {
    title: `${item.name}${eraTag}`,
    description:
      item.description?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Curated Collections from Catskill Architectural Salvage.",
    openGraph: {
      title: `${item.name}${eraTag} | Catskill Architectural Salvage`,
      images: item.thumbnail ? [
        {
          url: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}`,
        },
      ] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await directus.request(
    readItem("props", id, {
      fields: [
        "*",
        "photo_gallery.*",
        "availability",
        "date_sold",
        "source_url",
        { category: ["id", "name", "slug"] },
        {
          user_created: [
            "id",
            "description",
            "avatar",
            "shop_name",
          ],
        },
      ],
    }),
  );

  if (!item) notFound();

  const isSold = item.availability === "sold";
  const hasPrice = item.purchase_price && Number(item.purchase_price) > 0;
  const isExternal = Boolean(item.source_url);
  
  const vendorName = item.user_created
    ? `${item.user_created.shop_name || ""}`.trim()
    : "Unnamed Shop";

  const hasDimensions =
    Boolean(item.weight) &&
    Boolean(item.length) &&
    Boolean(item.width) &&
    Boolean(item.height);

  // Prepare contact link with pre-filled parameters
  const contactLink = `/contact?type=${isExternal ? "general" : "request"}&item=${encodeURIComponent(`${item.name} (CAS-${String(id).padStart(4, "0")})`)}`;

  return (
    <main className="min-h-full w-full bg-[#F9F8F6] text-zinc-700 selection:bg-blue-100 pb-24">
      <ViewTracker id={id} />
      <div className="max-w-6xl mx-auto px-8 py-12 lg:py-8">
        {/* BREADCRUMBS */}
        <nav className="mb-10 border-b border-zinc-200 pb-4 flex items-center gap-3">
          <Link
            href="/inventory"
            className="text-detail font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <span className="text-zinc-300 text-detail">—</span>
          {item.category ? (
            <Link
              href={`/inventory?category=${item.category.slug}`}
              className="text-detail font-black uppercase tracking-[0.3em] text-blue-600 transition-colors"
            >
              {item.category.name}
            </Link>
          ) : (
            <span className="text-detail font-black uppercase tracking-[0.3em] text-zinc-300">
              General Salvage
            </span>
          )}
          <span className="text-zinc-300 text-detail">—</span>
          <span className="text-detail font-black uppercase tracking-[0.3em] text-zinc-800 truncate max-w-50 md:max-w-none">
            {item.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <ArtifactGallery
            thumbnail={item.thumbnail}
            photo_gallery={item.photo_gallery}
            name={item.name}
            isSold={isSold}
          />

          <section className="lg:col-span-5">
            <div className="mb-10">
              {/* EXTERNAL SOURCE NOTICE */}
              {isExternal && (
                <div className="mb-6 flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2">
                  <Info size={14} className="text-blue-600" />
                  <span className="text-detail font-bold uppercase tracking-widest text-blue-700">
                    Third-Party Listed
                  </span>
                </div>
              )}

              <Link
                href={`/inventory?vendor=${item.user_created?.id}`}
                className="inline-flex items-center gap-2 mb-6 group"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300">
                  {item.user_created?.avatar ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.user_created.avatar}?width=40`}
                      alt={vendorName}
                    />
                  ) : (
                    <Store size={10} className="text-zinc-500" />
                  )}
                </div>
                <span className="text-detail font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-blue-600 transition-colors">
                  Listed by: {vendorName}
                </span>
              </Link>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-detail font-mono font-bold uppercase tracking-[0.2em] bg-zinc-800 text-white px-2 py-0.5">
                  CAS—{String(item.id).padStart(4, "0")}
                </span>

                {item.classification && (
                  <>
                    <span className="text-zinc-300 text-detail">|</span>
                    <span className="text-detail font-black uppercase tracking-[0.2em] text-zinc-500 italic">
                      {item.classification.replace(/-/g, " ")}
                    </span>
                  </>
                )}

                <span className="text-zinc-300 text-detail">|</span>
                <span
                  className={`text-detail font-black uppercase tracking-[0.2em] ${isSold ? "text-zinc-400" : "text-blue-600"}`}
                >
                  {isSold ? "Sold" : "Available"}
                </span>
              </div>

              <h1
                className={`text-4xl font-bold uppercase tracking-tighter italic leading-[0.9] mb-6 ${isSold ? "text-zinc-400" : "text-zinc-800"}`}
              >
                {item.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <span
                  className={`text-4xl font-light tracking-tighter ${isSold ? "text-zinc-300 line-through" : "text-zinc-900"}`}
                >
                  {hasPrice
                    ? `$${Number(item.purchase_price).toLocaleString()}`
                    : "Call for Price"}
                </span>
                {!isSold && hasPrice && (
                  <span className="text-detail font-black uppercase tracking-widest text-zinc-400">
                    USD + Shipping
                  </span>
                )}
              </div>
            </div>

            <div className="mb-12 text-zinc-500 leading-relaxed border-l border-zinc-200 pl-8 text-base font-medium max-w-prose">
              <div
                className="prose prose-zinc prose-sm italic"
                dangerouslySetInnerHTML={{ __html: item.description || "" }}
              />
            </div>

            <div className="grid grid-cols-1 border-t border-zinc-200 mb-12">
              <div className="flex justify-between py-4 border-b border-zinc-100 items-baseline">
                <h4 className="text-detail uppercase font-black tracking-[0.3em] text-zinc-400">
                  Object Weight
                </h4>
                <p className="text-label font-bold text-zinc-600 font-mono">
                  {item.weight ? `${item.weight} LBS` : "—"}
                </p>
              </div>
              <div className="flex justify-between py-4 border-b border-zinc-100 items-baseline">
                <h4 className="text-detail uppercase font-black tracking-[0.3em] text-zinc-400">
                  Dimensions (L×W×H)
                </h4>
                <p className="text-label font-bold text-zinc-600 font-mono">
                  {item.length && item.width && item.height
                    ? `${item.length}" × ${item.width}" × ${item.height}"`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* PRIMARY ACTION BUTTONS */}
              {!isSold && (
                <div className="flex flex-col gap-4">
                  {isExternal ? (
                    <div className="group relative">
                      <a
                        href={item.source_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 text-white py-5 text-label font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        View Original Listing <ExternalLink size={16} />
                      </a>
                      <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50">
                        <p className="text-detail font-bold uppercase tracking-widest text-blue-700 mb-1">
                          Note
                        </p>
                        <p className="text-detail text-blue-600/80 leading-relaxed">
                          This item is part of our aggregated digital collection. 
                          Final transaction and logistics are managed directly by the 
                          originating archive.
                        </p>
                      </div>
                    </div>
                  ) : hasPrice ? (
                    <form action={createCheckout}>
                      <input type="hidden" name="price" value={item.purchase_price} />
                      <input type="hidden" name="itemName" value={item.name} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <button
                        type="submit"
                        className="w-full bg-zinc-800 text-white py-5 text-label font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]"
                      >
                        Purchase
                      </button>
                    </form>
                  ) : (
                    <a
                      href={`mailto:info@catskillas.com?subject=Inquiry: ${item.name} (Ref: CAS-${item.id})`}
                      className="w-full bg-zinc-800 text-white py-5 text-label font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all text-center block"
                    >
                      Request Pricing
                    </a>
                  )}
                  
                  {/* DYNAMIC CONTACT VENDOR BUTTON */}
                  <Link
                    href={contactLink}
                    className="w-full border border-zinc-300 text-zinc-500 py-4 text-label font-black uppercase tracking-[0.2em] hover:bg-zinc-800 hover:text-white hover:border-zinc-800 transition-all flex items-center justify-center gap-3"
                  >
                    <MessageSquare size={14} /> Contact Vendor
                  </Link>
                </div>
              )}

              {isSold && (
                <div className="w-full bg-zinc-100 text-zinc-400 py-5 text-label font-black uppercase tracking-[0.4em] border border-zinc-200 text-center cursor-not-allowed">
                  Item Out of Circulation
                </div>
              )}

              {!isSold && (
                <div className="pt-2 group/shipping relative">
                  <ShippingDrawer
                    weight={Number(item.weight) || 0}
                    length={Number(item.length) || 0}
                    width={Number(item.width) || 0}
                    height={Number(item.height) || 0}
                    itemName={item.name}
                    id={item.id}
                    disabled={!hasDimensions || isExternal}
                  />
                  
                  {/* TOOLTIP WITH 11PX TEXT */}
                  {(!hasDimensions || isExternal) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-widest opacity-0 group-hover/shipping:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                      {isExternal 
                        ? "Logistics for external items are handled by the original seller." 
                        : "Dimensional data required for automated shipping quotes."}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-800" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-24 space-y-24">
          {item.user_created?.id && (
            <MoreFromVendor
              vendorId={item.user_created.id}
              vendorName={item.user_created.shop_name}
              currentId={id}
            />
          )}

          {item.category && (
            <RelatedArtifacts
              categoryId={item.category.id}
              categoryName={item.category.name}
              categorySlug={item.category.slug}
              currentId={id}
              classification={item.classification}
            />
          )}
          <RecentlyViewed currentId={id} />
        </div>
      </div>
    </main>
  );
}