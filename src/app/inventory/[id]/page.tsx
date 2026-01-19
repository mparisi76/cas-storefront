/* eslint-disable @next/next/no-img-element */
import ShippingDrawer from "@/components/ShippingDrawer";
import directus from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { notFound } from "next/navigation";
import Link from "next/link"; // Added Link import

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await directus.request(
    readItem("props", id, {
      // Updated fields to include the category relation for the breadcrumb
      fields: ["*", "images.*", { category: ["name", "slug"] }],
    })
  );

  if (!item) notFound();

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-zinc-700 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-8 py-12 lg:py-16">
        {/* Navigation - Dynamic Breadcrumbs */}
        <nav className="mb-10 border-b border-zinc-200 pb-4 flex items-center gap-2">
          <Link
            href="/inventory"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-blue-600 transition-colors"
          >
            Catalog
          </Link>

          <span className="text-zinc-300 text-[10px]">/</span>

          {item.category ? (
            <Link
              href={`/inventory?category=${item.category.slug}`}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-blue-600 transition-colors"
            >
              {item.category.name}
            </Link>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
              Salvage
            </span>
          )}

          <span className="text-zinc-300 text-[10px]">/</span>

          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-800 truncate max-w-75">
            {item.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <section className="lg:col-span-6">
            <div className="aspect-4/5 bg-white shadow-lg relative overflow-hidden border border-zinc-200">
              {item.thumbnail && (
                <img
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}`}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </section>

          <section className="lg:col-span-6 lg:pl-6">
            <div className="mb-8">
              <span className="text-xs font-mono text-zinc-400 mb-2 block uppercase">
                Inventory Ref:{" "}
                <span className="text-zinc-600 font-bold">
                  CAS-{String(item.id).padStart(4, "0")}
                </span>
              </span>

              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight text-zinc-600 mb-4 italic">
                {item.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-light text-blue-600">
                  {item.purchase_price
                    ? `$${Number(item.purchase_price).toLocaleString()}`
                    : "POA"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 px-3 py-1">
                  Available
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
                <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1">
                  Weight
                </h4>
                <p className="text-lg font-medium text-zinc-600">
                  {item.weight || "—"} <span className="text-xs">lbs</span>
                </p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1">
                  Dimensions
                </h4>
                <p className="text-lg font-medium text-zinc-600">
                  {`${item.length || 0}" × ${item.width || 0}" × ${
                    item.height || 0
                  }"`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-zinc-800 text-white py-4 text-lg font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">
                Inquire
              </button>

              <ShippingDrawer
                weight={Number(item.weight) || 0}
                length={Number(item.length) || 0}
                width={Number(item.width) || 0}
                height={Number(item.height) || 0}
                itemName={item.name}
                id={item.id}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
