import ShippingDrawer from "@/components/ShippingDrawer";
import ArtifactGallery from "@/components/ArtifactGallery";
import directus from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createCheckout } from "@/app/actions/checkout";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await directus.request(
    readItem("props", id, {
      fields: ["name", "description", "thumbnail"],
    }),
  );

  if (!item) return { title: "Artifact Not Found" };

  return {
    title: item.name,
    description:
      item.description?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Historical artifact from Catskill Architectural Salvage.",
    openGraph: {
      title: `${item.name} | Catskill Architectural Salvage`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}`,
        },
      ],
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
        { category: ["name", "slug"] },
      ],
    }),
  );

  if (!item) notFound();

  const isSold = item.availability === "sold";

  // Logic for shipping availability
  const hasDimensions = 
    Number(item.weight) > 0 && 
    Number(item.length) > 0 && 
    Number(item.width) > 0 && 
    Number(item.height) > 0;

  return (
    <main className="min-h-full w-full bg-[#F9F8F6] text-zinc-700 selection:bg-blue-100 pb-24">
      <div className="max-w-6xl mx-auto px-8 py-12 lg:py-16">
        {/* Navigation - Font Bumped to 11px */}
        <nav className="mb-10 border-b border-zinc-200 pb-4 flex items-center gap-2">
          <Link
            href="/inventory"
            className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-blue-600 transition-colors"
          >
            Catalog
          </Link>
          <span className="text-zinc-300 text-[11px]">/</span>
          {item.category ? (
            <Link
              href={`/inventory?category=${item.category.slug}`}
              className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50/50 px-2 py-0.5 transition-colors"
            >
              {item.category.name}
            </Link>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300">
              Salvage
            </span>
          )}
          <span className="text-zinc-300 text-[11px]">/</span>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-800 truncate max-w-75">
            {item.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <ArtifactGallery
            thumbnail={item.thumbnail}
            photo_gallery={item.photo_gallery}
            name={item.name}
            isSold={isSold}
          />

          <section className="lg:col-span-6 lg:pl-6">
            <div className="mb-8">
              <span className="text-[13px] font-mono text-zinc-600 mb-2 block uppercase">
                Inventory Ref:{" "}
                <span className="text-zinc-600 font-bold">
                  CAS—{String(item.id).padStart(4, "0")}
                </span>
              </span>
              <h1
                className={`text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-4 italic ${isSold ? "text-zinc-400" : "text-zinc-600"}`}
              >
                {item.name}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`text-3xl font-light ${isSold ? "text-zinc-300 line-through" : "text-blue-600"}`}
                >
                  {item.purchase_price
                    ? `$${Number(item.purchase_price).toLocaleString()}`
                    : "POA"}
                </span>
                {/* Status Badge - Font Bumped to 11px */}
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest border px-3 py-1 ${isSold ? "border-zinc-200 text-zinc-400 bg-zinc-50" : "border-blue-100 text-blue-600 bg-blue-50"}`}
                >
                  {isSold ? "Sold" : "Available"}
                </span>
              </div>
            </div>

            <div className="mb-10 text-zinc-500 leading-relaxed border-l-2 border-zinc-200 pl-6 italic text-base">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    item.description || "Inquiry for historical provenance.",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y border-zinc-200 mb-10">
              <div>
                <h4 className="text-[11px] uppercase font-black tracking-widest text-zinc-600 mb-1">
                  Weight
                </h4>
                <p className="text-lg font-medium text-zinc-600">
                  {item.weight || "—"} <span className="text-xs">lbs</span>
                </p>
              </div>
              <div>
                <h4 className="text-[11px] uppercase font-black tracking-widest text-zinc-600 mb-1">
                  Dimensions
                </h4>
                <p className="text-lg font-medium text-zinc-600">{`${item.length || 0}" × ${item.width || 0}" × ${item.height || 0}"`}</p>
              </div>
            </div>

            <div className="space-y-3">
              {isSold ? (
                <button
                  disabled
                  className="w-full bg-zinc-100 text-zinc-600 py-4 text-lg font-bold uppercase tracking-widest border border-zinc-200 cursor-not-allowed"
                >
                  Archived
                </button>
              ) : item.purchase_price ? (
                <form action={createCheckout}>
                  <input type="hidden" name="price" value={item.purchase_price} />
                  <input type="hidden" name="itemName" value={item.name} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="w-full bg-zinc-800 text-white py-4 text-lg font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                  >
                    Purchase Now
                  </button>
                </form>
              ) : (
                <a
                  href={`mailto:info@catskillas.com?subject=Inquiry: ${item.name} (Ref: CAS-${item.id})`}
                  className="w-full bg-zinc-800 text-white py-4 text-lg font-bold uppercase tracking-widest hover:bg-blue-600 transition-all text-center block shadow-sm"
                >
                  Inquire for Price
                </a>
              )}

              {/* SHIPPING CALCULATION */}
              {!isSold && (
                <div className="pt-2">
                  <ShippingDrawer
                    weight={Number(item.weight) || 0}
                    length={Number(item.length) || 0}
                    width={Number(item.width) || 0}
                    height={Number(item.height) || 0}
                    itemName={item.name}
                    id={item.id}
                    disabled={!hasDimensions} // You'll need to update ShippingDrawer to accept this prop
                  />
                  {!hasDimensions && (
                    <p className="mt-3 text-[11px] text-zinc-400 italic leading-snug">
                      Shipping calculation unavailable: Please contact the gallery for a custom freight quote for oversized or unweighted items.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}